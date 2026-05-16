import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Star, Eye, Copy, TrendingUp, Clock, Users } from 'lucide-react';
import { supabase, type SkillTreeRecord } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface TreeWithCreator extends SkillTreeRecord {
  creator?: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trees, setTrees] = useState<TreeWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'trending' | 'recent' | 'top_rated'>('trending');

  useEffect(() => {
    document.title = 'Pathfinder | Tree Marketplace';
    loadTrees();
  }, [filter]);

  const loadTrees = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('skill_trees')
        .select(`
          *,
          creator:created_by (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('is_public', true);

      if (filter === 'trending') {
        query = query.order('views_count', { ascending: false });
      } else if (filter === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (filter === 'top_rated') {
        query = query.order('rating_sum', { ascending: false });
      }

      query = query.limit(50);

      const { data, error } = await query;

      if (error) throw error;
      setTrees(data as TreeWithCreator[] || []);
    } catch (error) {
      console.error('Error loading trees:', error);
      toast.error('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleCloneTree = async (tree: TreeWithCreator) => {
    if (!user) {
      toast.error('Please sign in to clone trees');
      return;
    }

    try {
      // Increment clone count
      await supabase
        .from('skill_trees')
        .update({ clones_count: tree.clones_count + 1 })
        .eq('id', tree.id);

      // Navigate to the tree
      navigate(`/skill-tree/${encodeURIComponent(tree.topic)}`);
      toast.success(`Cloned "${tree.topic}"! Start learning now.`);
    } catch (error) {
      console.error('Error cloning tree:', error);
      toast.error('Failed to clone tree');
    }
  };

  const handleViewTree = async (tree: TreeWithCreator) => {
    try {
      // Increment view count
      await supabase.rpc('increment_tree_views', { tree_id: tree.id });
      
      // Navigate to the tree
      navigate(`/skill-tree/${encodeURIComponent(tree.topic)}`);
    } catch (error) {
      console.error('Error viewing tree:', error);
    }
  };

  const filteredTrees = trees.filter(tree =>
    tree.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAverageRating = (tree: SkillTreeRecord) => {
    if (tree.rating_count === 0) return 0;
    return (tree.rating_sum / tree.rating_count).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-lg font-bold gradient-text hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5" />
            Tree Marketplace
            <TrendingUp className="h-5 w-5 text-primary" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skill trees..."
              className="pl-12 glass-strong text-lg py-6"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setFilter('trending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                filter === 'trending'
                  ? 'glass-strong border border-primary text-primary'
                  : 'glass hover:border-primary/50'
              }`}
            >
              🔥 Trending
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                filter === 'recent'
                  ? 'glass-strong border border-primary text-primary'
                  : 'glass hover:border-primary/50'
              }`}
            >
              🆕 Recent
            </button>
            <button
              onClick={() => setFilter('top_rated')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                filter === 'top_rated'
                  ? 'glass-strong border border-primary text-primary'
                  : 'glass hover:border-primary/50'
              }`}
            >
              ⭐ Top Rated
            </button>
          </div>
        </div>

        {/* Trees Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-muted-foreground">Loading marketplace...</p>
          </div>
        ) : filteredTrees.length === 0 ? (
          <div className="text-center py-12 glass rounded-2xl">
            <div className="text-6xl mb-4">🌳</div>
            <p className="text-xl font-bold">No trees found</p>
            <p className="text-muted-foreground mt-2">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrees.map((tree) => (
              <div
                key={tree.id}
                className="glass rounded-2xl overflow-hidden hover-scale transition-all duration-300 border border-card-border"
              >
                <div className="p-6 space-y-4">
                  {/* Title */}
                  <h3 className="text-xl font-bold line-clamp-2">{tree.topic}</h3>

                  {/* Creator */}
                  {tree.creator && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-sm">
                        {tree.creator.avatar_url ? (
                          <img src={tree.creator.avatar_url} alt={tree.creator.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">by @{tree.creator.username}</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {tree.views_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Copy className="h-4 w-4" />
                      {tree.clones_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {getAverageRating(tree)}
                    </div>
                  </div>

                  {/* Featured Badge */}
                  {tree.is_featured && (
                    <span className="inline-flex items-center gap-1 glass px-3 py-1 rounded-full text-xs font-bold text-primary">
                      ⭐ Featured
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewTree(tree)}
                      variant="outline"
                      className="flex-1"
                    >
                      View
                    </Button>
                    <Button
                      onClick={() => handleCloneTree(tree)}
                      className="flex-1"
                      style={{ background: 'linear-gradient(135deg, hsl(190,100%,50%), hsl(258,90%,66%))' }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Clone
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!user && (
          <div className="glass-strong rounded-2xl p-8 text-center space-y-4">
            <h3 className="text-2xl font-bold gradient-text">Join the Community</h3>
            <p className="text-muted-foreground">Sign up to clone trees, rate content, and share your own learning paths!</p>
            <Button
              onClick={() => navigate('/')}
              className="text-lg font-bold px-8 py-6 button-shimmer"
              style={{ background: 'linear-gradient(135deg, hsl(190,100%,50%), hsl(258,90%,66%))', boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}
            >
              Get Started
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MarketplacePage;
