import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatedBackground } from '@/components/landing/AnimatedBackground';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, Target, CheckCircle2, Lock, Play, Trophy } from 'lucide-react';
import { getCareerPath, getCareerPathProgress, type CareerPathTree } from '@/data/careerPaths';
import { getCompletedTopics, getTopicProgress } from '@/utils/progressStorage';

const CareerPathPage: React.FC = () => {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  const [path, setPath] = useState<any>(null);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [progressData, setProgressData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pathId) {
      let foundPath = getCareerPath(pathId);
      
      // If not a static path, check local storage for custom generated paths
      if (!foundPath) {
        try {
          const customPaths = JSON.parse(localStorage.getItem('custom_career_paths') || '{}');
          if (customPaths[pathId]) {
            foundPath = customPaths[pathId];
          }
        } catch (e) {
          console.error("Failed to parse custom career paths from local storage");
        }
      }

      setPath(foundPath);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [pathId]);

  useEffect(() => {
    if (path) {
      document.title = `${path.title} | Pathfinder`;
      
      // Load completed topics and progress data
      const loadData = async () => {
        const topics = await getCompletedTopics();
        setCompletedTopics(topics);
        setProgress(getCareerPathProgress(path.id, topics));
        
        // Load progress for all trees in this path
        const progressMap: Record<string, any> = {};
        for (const tree of path.trees) {
          const treeProgress = await getTopicProgress(tree.topic);
          if (treeProgress) {
            progressMap[tree.topic] = treeProgress;
          }
        }
        setProgressData(progressMap);
      };
      
      loadData();
    }
  }, [path]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--duo-bg)' }}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-xl font-bold" style={{ color: 'var(--duo-text)' }}>Loading Career Path...</p>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--duo-bg)' }}>
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold" style={{ color: 'var(--duo-text)' }}>Career path not found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const getTreeStatus = (tree: CareerPathTree): 'completed' | 'available' | 'locked' => {
    const isCompleted = completedTopics.some(topic =>
      topic.toLowerCase() === tree.topic.toLowerCase() ||
      topic.toLowerCase().includes(tree.topic.toLowerCase()) ||
      tree.topic.toLowerCase().includes(topic.toLowerCase())
    );
    if (isCompleted) return 'completed';

    // Check if previous tree is completed
    const prevTree = path.trees.find(t => t.order === tree.order - 1);
    if (!prevTree || tree.order === 1) return 'available';

    const prevCompleted = completedTopics.some(topic =>
      topic.toLowerCase() === prevTree.topic.toLowerCase() ||
      topic.toLowerCase().includes(prevTree.topic.toLowerCase()) ||
      prevTree.topic.toLowerCase().includes(topic.toLowerCase())
    );
    return prevCompleted ? 'available' : 'locked';
  };

  const handleTreeClick = (tree: CareerPathTree) => {
    const status = getTreeStatus(tree);
    if (status !== 'locked') {
      navigate(`/skill-tree/${encodeURIComponent(tree.topic)}`);
    }
  };

  const totalHours = path.trees.reduce((sum, tree) => sum + tree.estimatedHours, 0);
  const completedTrees = path.trees.filter(tree => getTreeStatus(tree) === 'completed').length;

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />

      <div className="relative z-10 flex-1">
        {/* Header */}
        <div className="glass-strong border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>

            <div className="flex items-start gap-6">
              <div className="text-6xl">{path.icon}</div>
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl font-bold gradient-text mb-2">
                    {path.title}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {path.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-bold">{path.estimatedMonths} months</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                      <p className="font-bold">{totalHours}h</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="font-bold">{completedTrees}/{path.trees.length} trees</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-bold text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Learning Path */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Learning Path</h2>
                <p className="text-muted-foreground mb-6">
                  Follow this structured path to master {path.title.toLowerCase()}. Complete each tree in order to unlock the next.
                </p>
              </div>

              {/* Trees List */}
              <div className="space-y-3">
                {path.trees.map((tree, index) => {
                  const status = getTreeStatus(tree);
                  const treeProgress = progressData[tree.topic];
                  const treeCompletion = treeProgress?.completionTimestamp ? 100 : 0;

                  return (
                    <div
                      key={index}
                      className={`glass rounded-xl p-5 transition-all duration-300 ${
                        status !== 'locked' ? 'hover-scale cursor-pointer' : 'opacity-50'
                      }`}
                      onClick={() => handleTreeClick(tree)}
                    >
                      <div className="flex items-center gap-4">
                        {/* Order Number */}
                        <div className={`glass-strong rounded-full w-10 h-10 flex items-center justify-center font-bold ${
                          status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          status === 'available' ? 'text-primary' :
                          'text-muted-foreground'
                        }`}>
                          {status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : status === 'locked' ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            tree.order
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{tree.topic}</h3>
                            {tree.isOptional && (
                              <span className="text-xs glass-strong px-2 py-0.5 rounded-full text-muted-foreground">
                                Optional
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {tree.estimatedHours}h
                            </span>
                            {status === 'completed' && (
                              <span className="text-green-400 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Completed
                              </span>
                            )}
                            {status === 'available' && (
                              <span className="text-primary flex items-center gap-1">
                                <Play className="h-3 w-3" />
                                Available
                              </span>
                            )}
                            {status === 'locked' && (
                              <span className="flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                Locked
                              </span>
                            )}
                          </div>
                          {treeProgress && treeCompletion < 100 && (
                            <Progress value={treeCompletion} className="h-1 mt-2" />
                          )}
                        </div>

                        {/* Action */}
                        {status === 'available' && (
                          <Button size="sm" onClick={() => handleTreeClick(tree)}>
                            {treeProgress ? 'Continue' : 'Start'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Skills */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">Skills You'll Learn</h3>
                <div className="space-y-2">
                  {path.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outcomes */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">What You'll Achieve</h3>
                <div className="space-y-2">
                  {path.outcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Trophy className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">Difficulty Level</h3>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    path.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                    path.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {path.difficulty === 'beginner' && 'Perfect for those new to the field'}
                  {path.difficulty === 'intermediate' && 'Requires some programming knowledge'}
                  {path.difficulty === 'advanced' && 'For experienced developers'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerPathPage;
