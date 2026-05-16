import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, X, Trophy, Zap, Flame, Calendar, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type Profile } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { username: urlUsername } = useParams<{ username: string }>();
  const { user, profile: currentUserProfile, updateProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    learning_goals: '',
    avatar_url: '',
  });

  const isOwnProfile = user && profile && user.id === profile.id;

  useEffect(() => {
    document.title = `Pathfinder | ${urlUsername || 'Profile'}`;
    loadProfile();
  }, [urlUsername, user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      if (urlUsername) {
        // Load other user's profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', urlUsername)
          .single();

        if (error) throw error;
        setProfile(data);
      } else if (currentUserProfile) {
        // Load own profile
        setProfile(currentUserProfile);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (profile) {
      setEditForm({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        learning_goals: profile.learning_goals || '',
        avatar_url: profile.avatar_url || '',
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
      await loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-6">
          <div className="text-8xl">👤</div>
          <h2 className="text-3xl font-bold gradient-text">Profile Not Found</h2>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-lg font-bold gradient-text hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5" />
            Profile
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Profile Header */}
        <div className="glass-strong rounded-3xl p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-6xl glow-cyan">
                {isEditing ? (
                  <Input
                    value={editForm.avatar_url}
                    onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                    placeholder="Avatar URL"
                    className="w-full"
                  />
                ) : profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username || 'User'} className="w-full h-full rounded-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>

              {/* Info */}
              <div className="space-y-2">
                {isEditing ? (
                  <Input
                    value={editForm.display_name}
                    onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                    placeholder="Display Name"
                    className="text-3xl font-bold"
                  />
                ) : (
                  <h1 className="text-4xl font-bold gradient-text">{profile.display_name || profile.username}</h1>
                )}
                <p className="text-muted-foreground">@{profile.username}</p>
                {profile.is_premium && (
                  <span className="inline-flex items-center gap-1 glass px-3 py-1 rounded-full text-sm font-bold text-primary">
                    ⭐ Premium
                  </span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            {isOwnProfile && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} size="sm" className="gap-2">
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                    <Button onClick={() => setIsEditing(false)} size="sm" variant="outline" className="gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEdit} size="sm" variant="outline" className="gap-2">
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-muted-foreground">Bio</h3>
            {isEditing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="w-full glass rounded-xl p-3 min-h-[100px] resize-none"
                maxLength={500}
              />
            ) : (
              <p className="text-foreground/80">{profile.bio || 'No bio yet.'}</p>
            )}
          </div>

          {/* Learning Goals */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-muted-foreground">Learning Goals</h3>
            {isEditing ? (
              <textarea
                value={editForm.learning_goals}
                onChange={(e) => setEditForm({ ...editForm, learning_goals: e.target.value })}
                placeholder="What do you want to learn?"
                className="w-full glass rounded-xl p-3 min-h-[100px] resize-none"
                maxLength={500}
              />
            ) : (
              <p className="text-foreground/80">{profile.learning_goals || 'No goals set yet.'}</p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-strong rounded-xl p-6 text-center space-y-2 hover-scale transition-all duration-300">
            <Zap className="h-8 w-8 text-primary mx-auto" />
            <p className="text-3xl font-bold gradient-text">{profile.total_xp}</p>
            <p className="text-sm text-muted-foreground">Total XP</p>
          </div>
          <div className="glass-strong rounded-xl p-6 text-center space-y-2 hover-scale transition-all duration-300">
            <Trophy className="h-8 w-8 text-secondary mx-auto" />
            <p className="text-3xl font-bold gradient-text">{profile.overall_level}</p>
            <p className="text-sm text-muted-foreground">Level</p>
          </div>
          <div className="glass-strong rounded-xl p-6 text-center space-y-2 hover-scale transition-all duration-300">
            <Flame className="h-8 w-8 text-orange-500 mx-auto" />
            <p className="text-3xl font-bold gradient-text">{profile.current_streak}🔥</p>
            <p className="text-sm text-muted-foreground">Current Streak</p>
          </div>
          <div className="glass-strong rounded-xl p-6 text-center space-y-2 hover-scale transition-all duration-300">
            <Award className="h-8 w-8 text-green-500 mx-auto" />
            <p className="text-3xl font-bold gradient-text">{profile.longest_streak}</p>
            <p className="text-sm text-muted-foreground">Longest Streak</p>
          </div>
        </div>

        {/* Member Since */}
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Add Friend Button (if viewing someone else's profile) */}
        {!isOwnProfile && user && (
          <Button
            onClick={() => toast.info('Friend system coming soon!')}
            className="w-full text-lg font-bold py-6 button-shimmer"
            style={{ background: 'linear-gradient(135deg, hsl(190,100%,50%), hsl(258,90%,66%))' }}
          >
            Add Friend
          </Button>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
