
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let token = localStorage.getItem('access_token');

  // Setup headers with the access token
  const headers = {
    ...options.headers,
    'Authorization': token ? `Bearer ${token}` : '',
  };

  try {
    let response = await fetch(url, { ...options, headers });

    // If the token is expired or unauthorized
    if (response.status === 401) {
      // Try to refresh the token using the HTTP-only cookie
      const refreshResponse = await fetch('http://127.0.0.1:8000/users/refresh', {
        method: 'POST',
        credentials: 'include', // Important: sends the refresh_token cookie
      });

      if (refreshResponse.ok) {
        // We got a new access token
        const data = await refreshResponse.json();
        
        // Ensure backend actually returns access_token in JSON as per Token model
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
          
          // Retry the original request with the new token
          const newHeaders = {
            ...options.headers,
            'Authorization': `Bearer ${data.access_token}`,
          };
          
          response = await fetch(url, { ...options, headers: newHeaders });
        } else {
          throw new Error('No access token in refresh response');
        }
      } else {
        // Refresh failed (e.g. refresh token expired or invalid)
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
