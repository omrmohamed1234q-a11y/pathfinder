import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Map, Clock, ArrowRight } from 'lucide-react';
import { getCompletedTopics, getAllProgress } from '@/utils/progressStorage';
import { careerPaths } from '@/data/careerPaths';

interface SearchResult {
  type: 'topic' | 'career-path' | 'suggestion';
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

export const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search logic
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      // Show recent/popular when empty
      const recentResults: SearchResult[] = [
        {
          type: 'suggestion',
          title: 'React',
          description: 'Popular topic',
          icon: '⚛️',
          action: () => navigate('/skill-tree/React')
        },
        {
          type: 'suggestion',
          title: 'Python',
          description: 'Popular topic',
          icon: '🐍',
          action: () => navigate('/skill-tree/Python')
        },
        {
          type: 'career-path',
          title: 'Full-Stack Developer',
          description: 'Career path',
          icon: '💻',
          action: () => navigate('/career-path/full-stack-developer')
        }
      ];
      setResults(recentResults);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    // Search in progress
    const allProgress = await getAllProgress();
    Object.keys(allProgress).forEach(topic => {
      if (topic.toLowerCase().includes(lowerQuery)) {
        const progress = allProgress[topic];
        const isCompleted = progress.completionTimestamp !== null;
        searchResults.push({
          type: 'topic',
          title: topic,
          description: isCompleted ? 'Completed' : 'In Progress',
          icon: isCompleted ? '✅' : '📚',
          action: () => navigate(`/skill-tree/${encodeURIComponent(topic)}`)
        });
      }
    });

    // Search in career paths
    careerPaths.forEach(path => {
      if (
        path.title.toLowerCase().includes(lowerQuery) ||
        path.description.toLowerCase().includes(lowerQuery) ||
        path.skills.some(skill => skill.toLowerCase().includes(lowerQuery))
      ) {
        searchResults.push({
          type: 'career-path',
          title: path.title,
          description: path.description,
          icon: path.icon,
          action: () => navigate(`/career-path/${path.id}`)
        });
      }
    });

    // Add suggestions if no results
    if (searchResults.length === 0) {
      searchResults.push({
        type: 'suggestion',
        title: `Learn "${searchQuery}"`,
        description: 'Generate a new skill tree',
        icon: '✨',
        action: () => {
          navigate('/');
          setTimeout(() => {
            const input = document.querySelector('input[placeholder*="topic"]') as HTMLInputElement;
            if (input) {
              input.value = searchQuery;
              input.focus();
            }
          }, 100);
        }
      });
    }

    setResults(searchResults);
    setSelectedIndex(0);
  }, [navigate]);

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        results[selectedIndex].action();
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleResultClick = (result: SearchResult) => {
    result.action();
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="glass rounded-lg px-3 py-2 flex items-center gap-2 hover-scale transition-all text-sm text-muted-foreground hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search</span>
        <kbd className="hidden md:inline glass-strong px-2 py-0.5 rounded text-xs">
          ⌘K
        </kbd>
      </button>

      {/* Search Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0">
          <DialogHeader className="px-4 pt-4 pb-0">
            <DialogTitle className="sr-only">Search</DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative px-4 py-3 border-b border-border">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics, career paths..."
              className="pl-10 border-0 focus-visible:ring-0 text-base"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto p-2">
            {results.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No results found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleResultClick(result)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left ${
                      index === selectedIndex
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="text-2xl flex-shrink-0">{result.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {result.description}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 opacity-50" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="glass-strong px-1.5 py-0.5 rounded">↑</kbd>
                <kbd className="glass-strong px-1.5 py-0.5 rounded">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="glass-strong px-1.5 py-0.5 rounded">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="glass-strong px-1.5 py-0.5 rounded">Esc</kbd>
                Close
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
