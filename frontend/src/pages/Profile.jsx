import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, LogOut, User as UserIcon, Camera, Save, Lock, AtSign, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateProfile, uploadAvatar } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const Field = ({ label, icon: Icon, children }) => (
  <div style={{ marginBottom: '20px' }}>
    <label style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px',
      textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '700',
    }}>
      {Icon && <Icon size={12} />} {label}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', background: '#0a0a0a', border: '1px solid #333',
  borderRadius: '2px', padding: '12px 14px', color: '#fff',
  fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    password: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'warning');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image must be under 5MB', 'warning');
      return;
    }

    // Preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const res = await uploadAvatar(file);
      updateUser({ avatar: res.data.avatar });
      setAvatarPreview(null);
      addToast('Profile photo updated!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to upload photo', 'error');
      setAvatarPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (form.password && form.password.length < 6) {
      addToast('Password must be at least 6 characters', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = { name: form.name };
      if (form.username) payload.username = form.username;
      if (form.password) payload.password = form.password;

      const res = await updateProfile(payload);
      updateUser(res.data);
      setForm((f) => ({ ...f, password: '', confirmPassword: '' }));
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const currentAvatar = avatarPreview || user.avatar;

  return (
    <div className="profile-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1>Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* ── Left: Avatar Card ── */}
        <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px', gap: '16px' }}>
          {/* Avatar with camera overlay */}
          <div
            onClick={handleAvatarClick}
            style={{ position: 'relative', cursor: 'pointer', borderRadius: '50%', display: 'inline-block' }}
            title="Change profile photo"
          >
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-green)', display: 'block' }}
              />
            ) : (
              <div style={{
                width: '110px', height: '110px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '42px', fontWeight: '800', color: '#fff',
                border: '2px solid var(--accent-green)',
              }}>
                {user.name?.charAt(0)}
              </div>
            )}
            {/* Hover overlay */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '4px',
              opacity: uploading ? 1 : 0, transition: 'opacity 0.2s',
            }}
            className="avatar-overlay"
            >
              <Camera size={22} color="#76b900" />
              <span style={{ fontSize: '10px', color: '#76b900', fontWeight: '700', letterSpacing: '0.5px' }}>
                {uploading ? 'UPLOADING…' : 'CHANGE'}
              </span>
            </div>

            <style>{`.avatar-overlay { opacity: 0; } div:hover > .avatar-overlay { opacity: 1 !important; }`}</style>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />

          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '800', color: '#fff' }}>{user.name}</h2>
            {user.username && (
              <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--accent-green)', fontWeight: '600' }}>@{user.username}</p>
            )}
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</p>
          </div>

          {/* Auth badge */}
          <div style={{ padding: '6px 14px', border: '1px solid #333', borderRadius: '2px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.5px', background: '#0a0a0a' }}>
            {user.googleId ? '🔗 Google OAuth' : '🔑 Local Account'}
          </div>

          {/* Sign out */}
          <button onClick={handleLogout} style={{
            marginTop: '8px', width: '100%', padding: '12px',
            background: 'rgba(239,68,68,0.06)', border: '1px solid var(--accent-red)',
            color: 'var(--accent-red)', borderRadius: '2px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontSize: '13px', fontWeight: '700', fontFamily: 'inherit', letterSpacing: '0.5px',
            transition: 'background 0.2s',
          }}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>

        {/* ── Right: Edit Form ── */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Identity */}
          <div className="bento-card">
            <h3 style={{ margin: '0 0 24px', fontSize: '14px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <UserIcon size={16} color="var(--accent-green)" /> Identity
            </h3>
            <Field label="Display Name" icon={UserIcon}>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                style={inputStyle}
              />
            </Field>
            <Field label="Username" icon={AtSign}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-green)', fontWeight: '700', fontSize: '14px' }}>@</span>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder={user.username ? user.username : 'choose a username'}
                  style={{ ...inputStyle, paddingLeft: '28px' }}
                />
              </div>
              {!user.username && (
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#76b900' }}>
                  ✓ Set a username to enable login without Google
                </p>
              )}
            </Field>
            <Field label="Email" icon={Mail}>
              <input value={user.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
            </Field>
          </div>

          {/* Password */}
          <div className="bento-card">
            <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Lock size={16} color="var(--accent-green)" /> Password
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '12px', color: 'var(--text-muted)' }}>
              {user.googleId ? 'Set a password to also log in with username + password.' : 'Change your account password.'}
            </p>
            <Field label="New Password">
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current"
                style={inputStyle}
              />
            </Field>
            <Field label="Confirm Password">
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat new password"
                  style={inputStyle}
                />
                {form.password && form.confirmPassword && (
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    {form.password === form.confirmPassword
                      ? <Check size={16} color="#76b900" />
                      : <X size={16} color="var(--accent-red)" />}
                  </span>
                )}
              </div>
            </Field>
          </div>

          {/* Save */}
          <button type="submit" disabled={saving} style={{
            padding: '14px 32px', background: '#76b900', border: 'none',
            borderRadius: '2px', color: '#000', fontSize: '13px',
            fontWeight: '800', fontFamily: 'inherit', cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', letterSpacing: '0.5px',
            transition: 'opacity 0.2s', alignSelf: 'flex-start',
          }}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
