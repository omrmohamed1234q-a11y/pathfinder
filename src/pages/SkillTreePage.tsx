import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatedBackground } from '@/components/landing/AnimatedBackground';
import { SkillTreeHeader } from '@/components/skilltree/SkillTreeHeader';
import { StatsBanner } from '@/components/skilltree/StatsBanner';
import { SkillTreeCanvasAlt } from '@/components/skilltree/SkillTreeCanvasAlt';
import { NodeModal } from '@/components/skilltree/NodeModal';
import { LevelUpOverlay } from '@/components/skilltree/LevelUpOverlay';
import { CompletionOverlay } from '@/components/skilltree/CompletionOverlay';
import { SkeletonTree } from '@/components/skilltree/SkeletonTree';
import { ErrorState } from '@/components/skilltree/ErrorState';
import { SkillAssessmentModal } from '@/components/skilltree/SkillAssessmentModal';
import { ShareModal } from '@/components/ShareModal';
import { ZoomPanContainer } from '@/components/skilltree/ZoomPanContainer';
import { ZoomControls } from '@/components/skilltree/ZoomControls';
import { QuizSettingsModal, type QuizSettings } from '@/components/skilltree/QuizSettingsModal';
import { PracticeQuizModal } from '@/components/skilltree/PracticeQuizModal';
import type { SkillNode, SkillTree } from '@/types/skilltree';
import { generateSkillTree, generateAssessment, generateQuiz, type AssessmentQuestion, type GeneratedQuiz } from '@/services/aiService';
import { generateNodeImage, pollImageStatus } from '@/services/imageService';
import { demoSkillTree, isDemoTopic } from '@/data/demoSkillTree';
import {
  getTopicProgress, saveTopicProgress, initializeTopicProgress,
  calculateLevel, formatTimeDuration, cacheSkillTree, getCachedSkillTree,
  cacheNodeImage, getCachedNodeImage,
} from '@/utils/progressStorage';
import { playUnlockSound } from '@/utils/soundEffects';
import { toast } from 'sonner';

const SkillTreePage: React.FC = () => {
  const { topic: topicParam } = useParams<{ topic: string }>();
  const navigate = useNavigate();
  const topic = decodeURIComponent(topicParam || '');
  const searchParams = new URLSearchParams(window.location.search);
  const isFromScan = searchParams.get('source') === 'scan';

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillTree, setSkillTree] = useState<SkillTree | null>(null);
  const [currentXP, setCurrentXP] = useState(0);
  const [completedNodeIds, setCompletedNodeIds] = useState<number[]>([]);
  const [level, setLevel] = useState(1);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [currentBackgroundTopic, setCurrentBackgroundTopic] = useState<string>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [completionTimestamp, setCompletionTimestamp] = useState<number | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Practice Quiz state
  const [showQuizSettings, setShowQuizSettings] = useState(false);
  const [showPracticeQuiz, setShowPracticeQuiz] = useState(false);
  const [practiceQuizData, setPracticeQuizData] = useState<GeneratedQuiz | null>(null);
  const [isGeneratingPracticeQuiz, setIsGeneratingPracticeQuiz] = useState(false);

  // Zoom/Pan state
  const zoomPanRef = useRef<HTMLDivElement>(null);
  const [currentZoom, setCurrentZoom] = useState(1);

  useEffect(() => {
    if (!topic) { navigate('/'); return; }
    document.title = `Pathfinder | ${topic}`;

    const loadSkillTree = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Check if topic is actually a tree_id (starts with "tree_")
        if (topic.startsWith('tree_')) {
          const existingTrees = JSON.parse(localStorage.getItem('skill_trees') || '{}');
          const treeData = existingTrees[topic];
          
          if (treeData && treeData.skill_tree) {
            const loadedTree = treeData.skill_tree;
            const savedProgress = await getTopicProgress(loadedTree.topic);
            
            if (savedProgress) {
              setCurrentXP(savedProgress.currentXP);
              setCompletedNodeIds(savedProgress.completedNodeIds);
              setLevel(savedProgress.currentLevel);
              setStartTimestamp(savedProgress.startTimestamp);
              setCompletionTimestamp(savedProgress.completionTimestamp);
              
              const updatedNodes = loadedTree.nodes.map((node: SkillNode) => {
                const img = getCachedNodeImage(loadedTree.topic, node.id);
                if (savedProgress.completedNodeIds.includes(node.id))
                  return { ...node, status: 'completed' as const, imageUrl: img || undefined };
                const parents = loadedTree.nodes.filter((n: SkillNode) => n.children.includes(node.id));
                const allDone = parents.every((p: SkillNode) => savedProgress.completedNodeIds.includes(p.id));
                if (allDone && node.id !== 1)
                  return { ...node, status: 'unlocked' as const, imageUrl: img || undefined };
                return { ...node, imageUrl: img || undefined };
              });
              
              setSkillTree({ ...loadedTree, nodes: updatedNodes });
              setCurrentBackgroundTopic(loadedTree.topic);
              if (savedProgress.completionTimestamp) setShowCompletion(true);
            } else {
              const newProgress = initializeTopicProgress(loadedTree.topic);
              await saveTopicProgress(newProgress);
              setSkillTree(loadedTree);
              setCurrentBackgroundTopic(loadedTree.topic);
            }
            
            setIsLoading(false);
            return;
          } else {
            // Tree ID not found, redirect to generator
            toast.error('Skill tree not found');
            navigate('/generate');
            return;
          }
        }
        
        // Check if this is a demo topic
        if (isDemoTopic(topic)) {
          toast.success('🎉 Loading Phase 2 Demo! Try Video, Flashcards, Projects & Challenges!');
          const savedProgress = await getTopicProgress(demoSkillTree.topic);
          if (savedProgress) {
            setCurrentXP(savedProgress.currentXP);
            setCompletedNodeIds(savedProgress.completedNodeIds);
            setLevel(savedProgress.currentLevel);
            setStartTimestamp(savedProgress.startTimestamp);
            setCompletionTimestamp(savedProgress.completionTimestamp);
            const updatedNodes = demoSkillTree.nodes.map((node) => {
              const img = getCachedNodeImage(demoSkillTree.topic, node.id);
              if (savedProgress.completedNodeIds.includes(node.id))
                return { ...node, status: 'completed' as const, imageUrl: img || undefined };
              const parents = demoSkillTree.nodes.filter(n => n.children.includes(node.id));
              const allDone = parents.every(p => savedProgress.completedNodeIds.includes(p.id));
              if (allDone && node.id !== 1)
                return { ...node, status: 'unlocked' as const, imageUrl: img || undefined };
              return { ...node, imageUrl: img || undefined };
            });
            setSkillTree({ ...demoSkillTree, nodes: updatedNodes });
            setCurrentBackgroundTopic(demoSkillTree.topic);
            if (savedProgress.completionTimestamp) setShowCompletion(true);
          } else {
            const newProgress = initializeTopicProgress(demoSkillTree.topic);
            await saveTopicProgress(newProgress);
            setSkillTree(demoSkillTree);
            setCurrentBackgroundTopic(demoSkillTree.topic);
          }
          setIsLoading(false);
          return;
        }

        // Regular flow for non-demo topics
        const cachedTree = getCachedSkillTree(topic) as SkillTree | null;
        if (cachedTree) {
          const savedProgress = await getTopicProgress(cachedTree.topic);
          if (savedProgress) {
            setCurrentXP(savedProgress.currentXP);
            setCompletedNodeIds(savedProgress.completedNodeIds);
            setLevel(savedProgress.currentLevel);
            setStartTimestamp(savedProgress.startTimestamp);
            setCompletionTimestamp(savedProgress.completionTimestamp);
            const updatedNodes = cachedTree.nodes.map((node) => {
              const img = getCachedNodeImage(cachedTree.topic, node.id);
              if (savedProgress.completedNodeIds.includes(node.id))
                return { ...node, status: 'completed' as const, imageUrl: img || undefined };
              const parents = cachedTree.nodes.filter(n => n.children.includes(node.id));
              const allDone = parents.every(p => savedProgress.completedNodeIds.includes(p.id));
              if (allDone && node.id !== 1)
                return { ...node, status: 'unlocked' as const, imageUrl: img || undefined };
              return { ...node, imageUrl: img || undefined };
            });
            setSkillTree({ ...cachedTree, nodes: updatedNodes });
            setCurrentBackgroundTopic(cachedTree.topic);
            if (savedProgress.completionTimestamp) setShowCompletion(true);
          } else {
            const newProgress = initializeTopicProgress(cachedTree.topic);
            await saveTopicProgress(newProgress);
            const nodesWithImages = cachedTree.nodes.map(n => ({ ...n, imageUrl: getCachedNodeImage(cachedTree.topic, n.id) || undefined }));
            setSkillTree({ ...cachedTree, nodes: nodesWithImages });
            setCurrentBackgroundTopic(cachedTree.topic);
          }
        } else {
          // No cached tree found, redirect to generator
          toast.info('Generating new skill tree...');
          navigate(`/generate?topic=${encodeURIComponent(topic)}`);
          return;
        }
      } catch (err) {
        console.error('Failed to load skill tree:', err);
        setError(err instanceof Error ? err.message : 'Failed to load skill tree');
      } finally {
        setIsLoading(false);
      }
    };
    loadSkillTree();
  }, [topic, navigate]);

  // Trigger assessment for new trees
  useEffect(() => {
    if (!skillTree || isLoading) return;
    
    // Check if assessment has been completed
    if (skillTree.assessmentCompleted) return;
    
    // Check if this is a new tree (no progress yet)
    const checkAndLoadAssessment = async () => {
      const progress = await getTopicProgress(skillTree.topic);
      if (progress && progress.completedNodeIds.length > 0) return;
      
      // Load assessment questions
      setIsLoadingAssessment(true);
      try {
        const result = await generateAssessment(skillTree.topic, '');
        setAssessmentQuestions(result.questions || []);
        setShowAssessment(true);
      } catch (error) {
        console.error('Failed to load assessment:', error);
        // Skip assessment on error
      } finally {
        setIsLoadingAssessment(false);
      }
    };
    
    checkAndLoadAssessment();
  }, [skillTree, isLoading]);

  // Keyboard shortcuts for zoom/pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const controls = (zoomPanRef.current as any)?.zoomPanControls;
      if (!controls) return;

      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          controls.zoomIn();
          setCurrentZoom(controls.getScale());
          break;
        case '-':
        case '_':
          e.preventDefault();
          controls.zoomOut();
          setCurrentZoom(controls.getScale());
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          controls.resetView();
          setCurrentZoom(controls.getScale());
          toast.info('View reset to default');
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          controls.fitToScreen();
          setCurrentZoom(controls.getScale());
          toast.info('Fitted to screen');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update current zoom when zoom changes
  useEffect(() => {
    const interval = setInterval(() => {
      const controls = (zoomPanRef.current as any)?.zoomPanControls;
      if (controls) {
        setCurrentZoom(controls.getScale());
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleAssessmentComplete = (score: number, skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert') => {
    setShowAssessment(false);
    
    // Update skill tree with assessment results
    if (skillTree) {
      const updatedTree: SkillTree = {
        ...skillTree,
        assessmentCompleted: true,
        assessmentScore: score,
        userSkillLevel: skillLevel
      };
      setSkillTree(updatedTree);
      cacheSkillTree(skillTree.topic, updatedTree);
      
      toast.success(`Assessment complete! Skill level: ${skillLevel} (${score}%)`);
      
      // Unlock nodes based on skill level
      if (skillLevel === 'advanced' || skillLevel === 'expert') {
        toast.info('💡 Tip: You can test out of beginner nodes by clicking them!');
      }
    }
  };

  const handleAssessmentSkip = () => {
    setShowAssessment(false);
    
    if (skillTree) {
      const updatedTree: SkillTree = {
        ...skillTree,
        assessmentCompleted: true,
        userSkillLevel: 'beginner' as const
      };
      setSkillTree(updatedTree);
      cacheSkillTree(skillTree.topic, updatedTree);
    }
  };

  // Practice Quiz handlers
  const handlePracticeQuizClick = () => {
    setShowQuizSettings(true);
  };

  const handleGeneratePracticeQuiz = async (settings: QuizSettings) => {
    setShowQuizSettings(false);
    setIsGeneratingPracticeQuiz(true);
    
    try {
      console.log(`🎯 [PRACTICE QUIZ] Generating with settings:`, settings);
      const result = await generateQuiz(
        topic,
        '',
        settings.numQuestions,
        settings.difficulty,
        settings.format
      );
      
      setPracticeQuizData(result);
      setShowPracticeQuiz(true);
      console.log(`✅ [PRACTICE QUIZ] Generated ${result.questions.length} questions`);
    } catch (error) {
      console.error('❌ [PRACTICE QUIZ] Failed to generate:', error);
      toast.error('Failed to generate practice quiz. Please try again.');
    } finally {
      setIsGeneratingPracticeQuiz(false);
    }
  };

  const handlePracticeQuizClose = () => {
    setShowPracticeQuiz(false);
    setPracticeQuizData(null);
  };

  const handlePracticeQuizRetry = () => {
    setShowPracticeQuiz(false);
    setPracticeQuizData(null);
    setShowQuizSettings(true);
  };

  const generateImagesForNodes = async (tree: SkillTree) => {
    setSkillTree(prev => prev ? { ...prev, nodes: prev.nodes.map(n => ({ ...n, isGeneratingImage: true })) } : prev);
    for (const node of tree.nodes) {
      try {
        const result = await generateNodeImage(node.title, node.illustration);
        const finalResult = await pollImageStatus(result.taskId);
        const imageUrl = finalResult.imageUrl;
        
        setSkillTree(prev => {
          if (!prev) return prev;
          return { ...prev, nodes: prev.nodes.map(n => n.id === node.id ? { ...n, imageUrl: imageUrl || undefined, isGeneratingImage: false } : n) };
        });
        if (imageUrl) cacheNodeImage(tree.topic, node.id, imageUrl);
      } catch {
        setSkillTree(prev => prev ? { ...prev, nodes: prev.nodes.map(n => n.id === node.id ? { ...n, isGeneratingImage: false } : n) } : prev);
      }
    }
  };

  const handleRetry = () => { setIsLoading(true); setError(null); window.location.reload(); };

  if (!topic) return null;

  if (isLoading) return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground topic={topic} />
      <SkeletonTree />
    </div>
  );

  if (error || !skillTree) return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground topic={topic} />
      <ErrorState message={error || 'Unknown error'} onRetry={handleRetry} />
    </div>
  );

  const totalXP = skillTree.nodes.reduce((sum, node) => sum + node.xp, 0);
  const totalNodes = skillTree.nodes.length;

  const handleNodeClick = (node: SkillNode) => {
    if (node.status === 'unlocked' || node.status === 'completed') {
      setSelectedNode(node);
      setCurrentBackgroundTopic(node.title);
      setIsModalOpen(true);
      if (!startTimestamp) setStartTimestamp(Date.now());
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
    setCurrentBackgroundTopic(skillTree.topic);
  };

  const handleNodeComplete = async () => {
    if (!selectedNode) return;

    const newXP = currentXP + selectedNode.xp;
    const newCompletedIds = [...completedNodeIds, selectedNode.id];
    const newLevel = calculateLevel(newCompletedIds.length, totalNodes);
    const now = Date.now();

    if (newLevel > level) setShowLevelUp(true);
    
    // Play unlock sound for newly unlocked children
    if (selectedNode.children.length > 0) {
      setTimeout(() => playUnlockSound(), 500);
    }

    setCurrentXP(newXP);
    setCompletedNodeIds(newCompletedIds);
    setLevel(newLevel);

    setSkillTree(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        nodes: prev.nodes.map(node => {
          if (node.id === selectedNode.id) return { ...node, status: 'completed' as const };
          if (selectedNode.children.includes(node.id)) return { ...node, status: 'unlocked' as const };
          return node;
        }),
      };
    });

    const isFullyCompleted = newCompletedIds.length === totalNodes;
    if (isFullyCompleted) {
      setCompletionTimestamp(now);
      setTimeout(() => setShowCompletion(true), 2000);
    }

    await saveTopicProgress({
      topic: skillTree.topic,
      completedNodeIds: newCompletedIds,
      currentXP: newXP,
      currentLevel: newLevel,
      startTimestamp: startTimestamp || now,
      completionTimestamp: isFullyCompleted ? now : null,
    });

    toast.success(`Completed: ${selectedNode.title}! +${selectedNode.xp} XP`);
  };

  const timeSpent = startTimestamp && completionTimestamp ? formatTimeDuration(startTimestamp, completionTimestamp) : '0s';

  const shareUrl = `${window.location.origin}/skill-tree/${encodeURIComponent(topic)}`;

  // Zoom/Pan control handlers
  const handleZoomIn = () => {
    const controls = (zoomPanRef.current as any)?.zoomPanControls;
    if (controls) {
      controls.zoomIn();
      setCurrentZoom(controls.getScale());
    }
  };

  const handleZoomOut = () => {
    const controls = (zoomPanRef.current as any)?.zoomPanControls;
    if (controls) {
      controls.zoomOut();
      setCurrentZoom(controls.getScale());
    }
  };

  const handleResetView = () => {
    const controls = (zoomPanRef.current as any)?.zoomPanControls;
    if (controls) {
      controls.resetView();
      setCurrentZoom(controls.getScale());
    }
  };

  const handleFitToScreen = () => {
    const controls = (zoomPanRef.current as any)?.zoomPanControls;
    if (controls) {
      controls.fitToScreen();
      setCurrentZoom(controls.getScale());
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground topic={skillTree.topic} />
      <div className="relative z-10 flex-1 flex flex-col">
        <SkillTreeHeader 
          topic={skillTree.topic} 
          currentXP={currentXP} 
          totalXP={totalXP} 
          isFromScan={isFromScan}
          onShare={() => setShowShareModal(true)}
          onPracticeQuiz={handlePracticeQuizClick}
        />
        <main className="flex-1 px-6 py-8 relative">
          <StatsBanner level={level} completedNodes={completedNodeIds.length} totalNodes={totalNodes} currentXP={currentXP} />
          
          {/* Zoom/Pan Container */}
          <div className="relative flex-1" style={{ minHeight: '500px' }}>
            <ZoomPanContainer ref={zoomPanRef} storageKey={`zoom-pan-${topic}`}>
              <SkillTreeCanvasAlt skillTree={skillTree} onNodeClick={handleNodeClick} />
            </ZoomPanContainer>
            
            {/* Zoom Controls */}
            <ZoomControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onReset={handleResetView}
              onFitToScreen={handleFitToScreen}
              currentZoom={currentZoom}
            />
          </div>
        </main>
      </div>
      {selectedNode && <NodeModal node={selectedNode} topic={skillTree.topic} isOpen={isModalOpen} onClose={handleModalClose} onComplete={handleNodeComplete} />}
      <LevelUpOverlay level={level} isVisible={showLevelUp} onComplete={() => setShowLevelUp(false)} />
      <CompletionOverlay topic={skillTree.topic} totalXP={totalXP} totalNodes={totalNodes} timeSpent={timeSpent} isVisible={showCompletion} />
      {showAssessment && assessmentQuestions.length > 0 && (
        <SkillAssessmentModal
          isOpen={showAssessment}
          topic={skillTree.topic}
          questions={assessmentQuestions}
          onComplete={handleAssessmentComplete}
          onSkip={handleAssessmentSkip}
        />
      )}
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        topic={skillTree.topic}
        shareUrl={shareUrl}
      />
      
      {/* Practice Quiz Modals */}
      <QuizSettingsModal
        isOpen={showQuizSettings}
        topic={skillTree.topic}
        onClose={() => setShowQuizSettings(false)}
        onGenerate={handleGeneratePracticeQuiz}
      />
      
      {practiceQuizData && (
        <PracticeQuizModal
          isOpen={showPracticeQuiz}
          quizData={practiceQuizData}
          topic={skillTree.topic}
          onClose={handlePracticeQuizClose}
          onRetry={handlePracticeQuizRetry}
        />
      )}
      
      {/* Loading indicator for practice quiz generation */}
      {isGeneratingPracticeQuiz && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg font-medium">Generating practice quiz...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTreePage;
