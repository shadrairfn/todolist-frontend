import React, { useEffect, useState } from 'react';
import { Check, KeyRound, Link2, MessageCircle, RefreshCw, RotateCcw, Save, Smartphone } from 'lucide-react';
import { usersApi } from '../../services/usersApi';
import { whatsappApi, type WhatsAppSessionStatus } from '../../services/whatsappApi';
import type { User, UserPayload } from '../../types/user';
import './UserManagement.css';

interface UserManagementProps {
  user: User | null;
  isLoading: boolean;
  error?: string;
  success?: string;
  onUpdateProfile: (payload: UserPayload) => Promise<void>;
  onChangePassword: (payload: { current_password: string; new_password: string }) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const displayName = (user: User | null) => user?.name || user?.email || 'Profile';

const whatsappStatusLabel = (status: WhatsAppSessionStatus | null) => {
  if (!status) return 'Not connected';
  if (status.stale_connected) return 'Reconnect needed';
  if (status.connected) return 'Connected';
  if (status.active) return 'Starting';
  return 'Not connected';
};

const whatsappStatusClass = (status: WhatsAppSessionStatus | null) => {
  if (!status) return '';
  if (status.stale_connected) return 'error';
  if (status.connected) return 'connected';
  if (status.active) return 'active';
  return '';
};

const UserManagement: React.FC<UserManagementProps> = ({
  user,
  isLoading,
  error,
  success,
  onUpdateProfile,
  onChangePassword,
  onRefresh,
}) => {
  const [profileForm, setProfileForm] = useState<UserPayload>({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '' });
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsapp_number || '');
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppSessionStatus | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [whatsappError, setWhatsappError] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isLinkingWhatsApp, setIsLinkingWhatsApp] = useState(false);
  const [isConnectingWhatsApp, setIsConnectingWhatsApp] = useState(false);
  const normalizedWhatsAppNumber = whatsappNumber.replace(/[^\d]/g, '');

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
    });
    setWhatsappNumber(user?.whatsapp_number || '');
  }, [user]);

  const submitProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profileForm.email?.trim()) return;

    setIsSavingProfile(true);
    try {
      await onUpdateProfile({
        name: profileForm.name?.trim() || '',
        email: profileForm.email.trim(),
      });
    } catch {
      // Parent owns the visible error message.
    } finally {
      setIsSavingProfile(false);
    }
  };

  const submitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordForm.current_password || !passwordForm.new_password) return;

    setIsSavingPassword(true);
    try {
      await onChangePassword(passwordForm);
      setPasswordForm({ current_password: '', new_password: '' });
    } catch {
      // Parent owns the visible error message.
    } finally {
      setIsSavingPassword(false);
    }
  };

  const refreshWhatsAppStatus = async (number = normalizedWhatsAppNumber) => {
    if (!number) return;
    setWhatsappError('');
    try {
      const status = await whatsappApi.status(number);
      setWhatsappStatus(status);
      if (status.connected) {
        setPairingCode('');
      } else if (status.pairing_code) {
        setPairingCode(status.pairing_code);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load WhatsApp status.';
      setWhatsappError(message);
    }
  };

  const linkWhatsApp = async () => {
    if (!normalizedWhatsAppNumber) return;
    setIsLinkingWhatsApp(true);
    setWhatsappError('');
    setWhatsappMessage('');
    try {
      const result = await usersApi.linkWhatsApp(normalizedWhatsAppNumber);
      setWhatsappMessage(result.message || 'WhatsApp number linked.');
      await onRefresh();
      await refreshWhatsAppStatus(normalizedWhatsAppNumber);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to link WhatsApp number.';
      setWhatsappError(message);
    } finally {
      setIsLinkingWhatsApp(false);
    }
  };

  const connectWhatsApp = async (resetStore = false) => {
    if (!user?.id || !normalizedWhatsAppNumber) return;
    setIsConnectingWhatsApp(true);
    setWhatsappError('');
    setWhatsappMessage('');
    setPairingCode('');
    try {
      const result = await whatsappApi.startSession({
        user_id: user.id,
        phone_number: normalizedWhatsAppNumber,
        reset_store: resetStore,
      });
      if (result.error) {
        throw new Error(result.error);
      }
      setWhatsappMessage(result.message || 'WhatsApp session started.');
      if (result.pairing_code) {
        setPairingCode(result.pairing_code);
      }
      await refreshWhatsAppStatus(normalizedWhatsAppNumber);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect WhatsApp.';
      setWhatsappError(message);
    } finally {
      setIsConnectingWhatsApp(false);
    }
  };

  return (
    <section className="users-management">
      <div className="users-toolbar">
        <div className="profile-heading">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName(user))}`}
            alt=""
          />
          <div>
            <h2>{displayName(user)}</h2>
            <p>{user?.email || 'Signed-in account'}</p>
          </div>
        </div>
        <button className="icon-text-button" onClick={onRefresh} disabled={isLoading} title="Refresh profile">
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {error && <div className="users-alert">{error}</div>}
      {success && (
        <div className="users-alert success">
          <Check size={15} />
          <span>{success}</span>
        </div>
      )}

      <form className="profile-form" onSubmit={submitProfile}>
        <div className="form-section-title">Profile</div>
        <label>
          <span>Name</span>
          <input
            value={profileForm.name || ''}
            placeholder="Your name"
            onChange={(event) => setProfileForm(prev => ({ ...prev, name: event.target.value }))}
            disabled={isLoading}
          />
        </label>
        <label>
          <span>Email</span>
          <input
            type="email"
            value={profileForm.email || ''}
            placeholder="you@example.com"
            onChange={(event) => setProfileForm(prev => ({ ...prev, email: event.target.value }))}
            disabled={isLoading}
            required
          />
        </label>
        <button className="icon-text-button primary" type="submit" disabled={isSavingProfile || isLoading}>
          <Save size={16} />
          <span>Save profile</span>
        </button>
      </form>

      <form className="profile-form" onSubmit={submitPassword}>
        <div className="form-section-title">Password</div>
        <label>
          <span>Current password</span>
          <input
            type="password"
            value={passwordForm.current_password}
            placeholder="Current password"
            onChange={(event) => setPasswordForm(prev => ({ ...prev, current_password: event.target.value }))}
            required
          />
        </label>
        <label>
          <span>New password</span>
          <input
            type="password"
            value={passwordForm.new_password}
            placeholder="Minimum 6 characters"
            onChange={(event) => setPasswordForm(prev => ({ ...prev, new_password: event.target.value }))}
            required
            minLength={6}
          />
        </label>
        <button className="icon-text-button" type="submit" disabled={isSavingPassword}>
          <KeyRound size={16} />
          <span>Change password</span>
        </button>
      </form>

      <div className="profile-form whatsapp-form">
        <div className="form-section-title">WhatsApp</div>
        <label>
          <span>Phone number</span>
          <input
            value={whatsappNumber}
            placeholder="6282118034442"
            inputMode="numeric"
            onChange={(event) => setWhatsappNumber(event.target.value)}
          />
        </label>

        <div className="whatsapp-status-panel">
          <div className={`status-dot ${whatsappStatusClass(whatsappStatus)}`} />
          <div>
            <strong>{whatsappStatusLabel(whatsappStatus)}</strong>
            <span>{user?.whatsapp_number ? `Linked to ${user.whatsapp_number}` : 'No number linked yet'}</span>
          </div>
        </div>

        <div className="whatsapp-actions">
          <button className="icon-text-button" type="button" onClick={linkWhatsApp} disabled={isLinkingWhatsApp || !normalizedWhatsAppNumber}>
            <Link2 size={16} />
            <span>Link</span>
          </button>
          <button className="icon-text-button primary" type="button" onClick={() => connectWhatsApp(false)} disabled={isConnectingWhatsApp || !user?.id || !normalizedWhatsAppNumber}>
            <MessageCircle size={16} />
            <span>Connect</span>
          </button>
          <button className="icon-text-button" type="button" onClick={() => refreshWhatsAppStatus()} disabled={!normalizedWhatsAppNumber}>
            <RefreshCw size={16} />
            <span>Status</span>
          </button>
          <button className="icon-text-button danger" type="button" onClick={() => connectWhatsApp(true)} disabled={isConnectingWhatsApp || !user?.id || !normalizedWhatsAppNumber}>
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>

        {pairingCode && (
          <div className="pairing-code">
            <Smartphone size={16} />
            <span>{pairingCode}</span>
          </div>
        )}
        {whatsappMessage && (
          <div className="users-alert success whatsapp-alert">
            <Check size={15} />
            <span>{whatsappMessage}</span>
          </div>
        )}
        {whatsappError && <div className="users-alert whatsapp-alert">{whatsappError}</div>}
      </div>
    </section>
  );
};

export default UserManagement;
