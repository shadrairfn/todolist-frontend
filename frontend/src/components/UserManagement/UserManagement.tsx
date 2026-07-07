import React, { useState } from 'react';
import { Check, KeyRound, RefreshCw, Save } from 'lucide-react';
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
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

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
    </section>
  );
};

export default UserManagement;
