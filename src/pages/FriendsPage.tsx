import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Check, X, Users, Search } from 'lucide-react';
import { supabase, type Profile } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend_profile?: Profile;
}

export const FriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    document.title = 'Pathfinder | Friends';
    if (user) {
      loadFriends();
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load accepted friends
      const { data: friendsData, error: friendsError } = await supabase
        .from('friendships')
        .select(`
          *,
          friend_profile:friend_id (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (friendsError) throw friendsError;

      // Also load friendships where current user is the friend
      const { data: reverseFriendsData, error: reverseFriendsError } = await supabase
        .from('friendships')
        .select(`
          *,
          friend_profile:user_id (*)
        `)
        .eq('friend_id', user.id)
        .eq('status', 'accepted');

      if (reverseFriendsError) throw reverseFriendsError;

      setFriends([...(friendsData || []), ...(reverseFriendsData || [])]);

      // Load pending requests (where current user is the recipient)
      const { data: pendingData, error: pendingError } = await supabase
        .from('friendships')
        .select(`
          *,
          friend_profile:user_id (*)
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;
      setPendingRequests(pendingData || []);
    } catch (error) {
      console.error('Error loading friends:', error);
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending',
        });

      if (error) throw error;
      toast.success('Friend request sent!');
      setSearchResults([]);
      setSearchQuery('');
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Friend request already sent');
      } else {
        console.error('Error sending friend request:', error);
        toast.error('Failed to send friend request');
      }
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;
      toast.success('Friend request accepted!');
      await loadFriends();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      toast.success('Friend request rejected');
      await loadFriends();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      toast.success('Friend removed');
      await loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-8xl">🔒</div>
          <h2 className="text-3xl font-bold gradient-text">Sign In Required</h2>
          <p className="text-muted-foreground text-lg">
            Create an account to connect with friends and learn together!
          </p>
          <Button
            onClick={() => navigate('/')}
            className="text-lg font-bold px-8 py-6 rounded-xl button-shimmer"
            style={{ background: 'linear-gradient(135deg, hsl(190,100%,50%), hsl(258,90%,66%))', boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-lg font-bold gradient-text hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5" />
            Friends
            <Users className="h-5 w-5 text-primary" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Search Users */}
        <div className="glass-strong rounded-2xl p-6 space-y-4">
          <h2 className="text-2xl font-bold gradient-text">Find Friends</h2>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by username..."
                className="pl-12 glass"
              />
            </div>
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((profile) => (
                <div key={profile.id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.username || 'User'} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        '👤'
                      )}
                    </div>
                    <div>
                      <p className="font-bold">{profile.username}</p>
                      <p className="text-sm text-muted-foreground">Level {profile.overall_level} • {profile.total_xp} XP</p>
                    </div>
                  </div>
                  <Button onClick={() => handleSendRequest(profile.id)} size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Friend
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="glass-strong rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-bold gradient-text">Friend Requests ({pendingRequests.length})</h2>
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <div key={request.id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                      {request.friend_profile?.avatar_url ? (
                        <img src={request.friend_profile.avatar_url} alt={request.friend_profile.username || 'User'} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        '👤'
                      )}
                    </div>
                    <div>
                      <p className="font-bold">{request.friend_profile?.username}</p>
                      <p className="text-sm text-muted-foreground">Level {request.friend_profile?.overall_level} • {request.friend_profile?.total_xp} XP</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleAcceptRequest(request.id)} size="sm" className="bg-green-500 hover:bg-green-600">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleRejectRequest(request.id)} size="sm" variant="outline">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="glass-strong rounded-2xl p-6 space-y-4">
          <h2 className="text-2xl font-bold gradient-text">My Friends ({friends.length})</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No friends yet. Search for users above to get started!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friendship) => {
                const friendProfile = friendship.friend_profile;
                if (!friendProfile) return null;

                return (
                  <div key={friendship.id} className="glass rounded-xl p-4 flex items-center justify-between hover-scale transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                        {friendProfile.avatar_url ? (
                          <img src={friendProfile.avatar_url} alt={friendProfile.username || 'User'} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <div>
                        <p className="font-bold">{friendProfile.username}</p>
                        <p className="text-sm text-muted-foreground">Level {friendProfile.overall_level} • {friendProfile.total_xp} XP • {friendProfile.current_streak}🔥 streak</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => navigate(`/profile/${friendProfile.username}`)} size="sm" variant="outline">
                        View Profile
                      </Button>
                      <Button onClick={() => handleRemoveFriend(friendship.id)} size="sm" variant="outline" className="text-red-500 hover:bg-red-500/20">
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FriendsPage;
