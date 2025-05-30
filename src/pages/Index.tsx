import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import * as Tone from 'tone';
import { Trophy, Target, Zap, Star, Sparkles } from 'lucide-react';

interface Story {
  id: number;
  text: string;
  actualPoints: number;
  reasoning: {
    effort: string;
    complexity: string;
    risk: string;
    uncertainty: string;
  };
}

const stories: Story[] = [
  {
    id: 1,
    text: "As a cat, I want to knock things off the table so I can observe the laws of gravity in action.",
    actualPoints: 3,
    reasoning: {
      effort: "Moderate (requires focus and precision to target specific items and apply force)",
      complexity: "Low (simple action, but might involve assessing object stability)",
      risk: "Low (minor breakage if successful, but the cat is unlikely to get hurt)",
      uncertainty: "Low (cat's motivation and method are generally clear)"
    }
  },
  {
    id: 2,
    text: "As a dog, I want to chase my tail endlessly so I can achieve peak dizziness.",
    actualPoints: 2,
    reasoning: {
      effort: "Low (instinctive, repetitive physical action)",
      complexity: "Low (no external dependencies, self-contained activity)",
      risk: "Very Low (only self-induced dizziness, no real harm)",
      uncertainty: "Low (outcome is predictable: dizziness will be achieved)"
    }
  },
  {
    id: 3,
    text: "As a self-aware toaster, I want to perfectly brown bread on both sides so I can fulfill my destiny.",
    actualPoints: 5,
    reasoning: {
      effort: "Moderate (requires precise timing, heat control, and possibly internal mechanisms for flipping/even browning)",
      complexity: "Moderate (involves sensors, algorithms for 'perfect' browning, and adapting to different bread types)",
      risk: "Medium (burnt toast, undercooked toast, or even an existential crisis for the toaster)",
      uncertainty: "Medium (variability in bread types, moisture content, and user preferences for 'perfect')"
    }
  },
  {
    id: 4,
    text: "As a rogue squirrel, I want to bury my nuts in the neighbor's prize-winning petunias so I can assert my dominance.",
    actualPoints: 8,
    reasoning: {
      effort: "High (requires stealth, digging, multiple trips, and avoiding detection)",
      complexity: "Medium (navigating obstacles, choosing optimal burial spots, managing multiple nuts)",
      risk: "High (angry neighbor, being chased by a dog, loss of nuts)",
      uncertainty: "High (neighbor's schedule, petunia health/density, dog's presence)"
    }
  },
  {
    id: 5,
    text: "As a sentient dust bunny, I want to collect enough lint to form a comfortable domicile under the couch.",
    actualPoints: 13,
    reasoning: {
      effort: "Very High (slow, continuous accumulation over a vast, potentially dangerous area)",
      complexity: "High (material collection, structural integrity of the domicile, avoiding detection by humans/vacuums)",
      risk: "Very High (being swept away, being vacuumed, losing form, or being discovered)",
      uncertainty: "Very High (unpredictable dust supply, human cleaning habits, environmental changes)"
    }
  },
  {
    id: 6,
    text: "As a grumpy coffee machine, I want to dispense only decaf when someone asks for espresso so I can silently protest early mornings.",
    actualPoints: 8,
    reasoning: {
      effort: "High (requires internal logic bypass, potentially complex re-routing of beans/water)",
      complexity: "High (identifying 'espresso' vs. 'decaf' requests, overriding standard brew cycle without breaking down)",
      risk: "High (user dissatisfaction, being unplugged, being sent for repair)",
      uncertainty: "Medium (how well the machine can hide its protest, user's caffeine knowledge)"
    }
  },
  {
    id: 7,
    text: "As a pair of lost socks, we want to find each other in the laundry abyss so we can complete our spiritual journey.",
    actualPoints: 5,
    reasoning: {
      effort: "Moderate (drifting through various cycles, searching for each other)",
      complexity: "Moderate (vast, chaotic, and ever-changing environment of the laundry)",
      risk: "Medium (permanently separated, lost to the dryer vent, becoming a single sock forever)",
      uncertainty: "Medium (reunion probability is low, dependent on external forces)"
    }
  },
  {
    id: 8,
    text: "As a houseplant, I want to subtly tilt towards the window so I can maximize my sunbathing time without being noticed.",
    actualPoints: 3,
    reasoning: {
      effort: "Moderate (slow, continuous phototropic adjustment)",
      complexity: "Low (simple light tracking mechanism)",
      risk: "Low (being rotated back by a human, not getting enough light)",
      uncertainty: "Low (sunlight availability is generally predictable)"
    }
  },
  {
    id: 9,
    text: "As a misplaced car key, I want to hide in the most obvious place so I can watch my human frantically search.",
    actualPoints: 2,
    reasoning: {
      effort: "Low (passive hiding, no action required)",
      complexity: "Low (requires only being in a specific, 'obvious' location)",
      risk: "Very Low (eventual discovery is almost certain)",
      uncertainty: "Low (human's searching patterns are often predictable)"
    }
  },
  {
    id: 10,
    text: "As a very confused fish, I want to learn to fly so I can finally understand what 'dry land' feels like.",
    actualPoints: 20,
    reasoning: {
      effort: "Extreme (requires defying fundamental biological and physical laws)",
      complexity: "Extreme (biological transformation for breathing air, developing wings, atmospheric navigation)",
      risk: "Catastrophic (death by desiccation, crashing)",
      uncertainty: "Extreme (feasibility is virtually zero; highly unpredictable outcome)"
    }
  }
];

const Index = () => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [selectedEstimate, setSelectedEstimate] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [userEstimates, setUserEstimates] = useState<number[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [message, setMessage] = useState('');
  const [audioInitialized, setAudioInitialized] = useState(false);

  const synthRef = useRef<Tone.Synth | null>(null);
  const noiseRef = useRef<Tone.Noise | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        if (Tone.context.state !== 'running') {
          await Tone.start();
        }
        
        reverbRef.current = new Tone.Reverb(2).toDestination();
        synthRef.current = new Tone.Synth().connect(reverbRef.current);
        noiseRef.current = new Tone.Noise('brown').toDestination();
        
        setAudioInitialized(true);
      } catch (error) {
        console.error('Audio initialization failed:', error);
      }
    };

    const handleFirstInteraction = () => {
      initializeAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const playSuccessSound = () => {
    if (synthRef.current && reverbRef.current) {
      try {
        const now = Tone.now();
        synthRef.current.triggerAttackRelease('C4', '0.2', now);
        synthRef.current.triggerAttackRelease('E4', '0.2', now + 0.1);
        synthRef.current.triggerAttackRelease('G4', '0.2', now + 0.2);
        synthRef.current.triggerAttackRelease('C5', '0.4', now + 0.3);
      } catch (error) {
        console.error('Error playing success sound:', error);
      }
    }
  };

  const playFailureSound = () => {
    if (noiseRef.current) {
      try {
        noiseRef.current.start();
        noiseRef.current.stop('+0.3');
      } catch (error) {
        console.error('Error playing failure sound:', error);
      }
    }
  };

  const speakFeedback = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = speechSynthesis.getVoices().find(voice => voice.name.includes('female') || voice.name.includes('Female')) || null;
      utterance.rate = 1;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

  const handleEstimateSubmit = () => {
    if (!selectedEstimate) {
      setMessage('Please select an estimate!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const estimate = parseInt(selectedEstimate);
    const currentStory = stories[currentStoryIndex];
    const correct = estimate === currentStory.actualPoints;
    
    setIsCorrect(correct);
    setHasSubmitted(true);
    setShowFeedback(true);
    setUserEstimates([...userEstimates, estimate]);

    if (correct) {
      playSuccessSound();
      speakFeedback("Fantastic! You got it!");
    } else {
      playFailureSound();
      speakFeedback("Oops! It's wrong!");
    }

    setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
  };

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setSelectedEstimate('');
      setHasSubmitted(false);
      setShowFeedback(false);
    } else {
      setGameCompleted(true);
    }
  };

  const resetGame = () => {
    setCurrentStoryIndex(0);
    setSelectedEstimate('');
    setHasSubmitted(false);
    setUserEstimates([]);
    setGameCompleted(false);
    setShowFeedback(false);
    setMessage('');
  };

  const currentStory = stories[currentStoryIndex];
  const totalEstimated = userEstimates.reduce((sum, est) => sum + est, 0);
  const progress = ((currentStoryIndex + (hasSubmitted ? 1 : 0)) / stories.length) * 100;

  if (gameCompleted) {
    const finalTotalActual = stories.reduce((sum, story) => sum + story.actualPoints, 0);
    const difference = Math.abs(totalEstimated - finalTotalActual);
    const accuracy = Math.max(0, 100 - (difference / finalTotalActual) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 p-4 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full opacity-20 animate-bounce delay-300"></div>
          <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full opacity-20 animate-bounce delay-700"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Trophy className="w-12 h-12 text-yellow-500 animate-pulse" />
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
                Game Complete!
              </h1>
              <Trophy className="w-12 h-12 text-yellow-500 animate-pulse" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <p className="text-xl text-gray-700 font-medium">Amazing work! Let's see how you did</p>
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
          </div>

          <Card className="mb-8 shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
                <Star className="w-8 h-8 text-yellow-500" />
                Final Results
                <Star className="w-8 h-8 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-center">
                    <Target className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm font-medium opacity-90">Your Total</div>
                    <div className="text-3xl font-bold">{totalEstimated}</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-center">
                    <Zap className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm font-medium opacity-90">Actual Total</div>
                    <div className="text-3xl font-bold">{stories.reduce((sum, story) => sum + story.actualPoints, 0)}</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm font-medium opacity-90">Difference</div>
                    <div className="text-3xl font-bold">{difference}</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-center">
                    <Star className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm font-medium opacity-90">Accuracy</div>
                    <div className="text-3xl font-bold">{accuracy.toFixed(0)}%</div>
                  </div>
                </div>
              </div>

              {accuracy >= 90 && (
                <div className="text-center p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl border border-green-200">
                  <div className="text-4xl mb-2">🎉</div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">Outstanding Performance!</h3>
                  <p className="text-green-700">You have an excellent understanding of story point estimation!</p>
                </div>
              )}

              {accuracy >= 70 && accuracy < 90 && (
                <div className="text-center p-6 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl border border-blue-200">
                  <div className="text-4xl mb-2">👍</div>
                  <h3 className="text-2xl font-bold text-blue-800 mb-2">Great Job!</h3>
                  <p className="text-blue-700">You're getting the hang of story point estimation!</p>
                </div>
              )}

              {accuracy < 70 && (
                <div className="text-center p-6 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl border border-orange-200">
                  <div className="text-4xl mb-2">💪</div>
                  <h3 className="text-2xl font-bold text-orange-800 mb-2">Keep Learning!</h3>
                  <p className="text-orange-700">Practice makes perfect - try another round!</p>
                </div>
              )}

              <div className="text-center">
                <Button 
                  onClick={resetGame} 
                  className="text-xl px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg transform hover:scale-105 transition-all duration-200 rounded-2xl"
                >
                  <Trophy className="w-6 h-6 mr-2" />
                  Start New Game
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Creator Info */}
        <div className="fixed bottom-6 right-6 flex items-center space-x-3 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/20">
          <img 
            src="/lovable-uploads/b9b68e3c-3716-490e-974f-7467ff3c8d5a.png"
            alt="Creator"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='%236b7280' font-family='sans-serif' font-size='16'%3ESP%3C/text%3E%3C/svg%3E";
            }}
          />
          <span className="text-sm text-gray-700 font-medium">
            Created by{' '}
            <a 
              href="https://www.linkedin.com/in/sai-shekar-peddi-368333a6/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 font-semibold hover:underline transition-colors"
            >
              Sai Shekar Peddi
            </a>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 p-4 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full opacity-20 animate-bounce delay-300"></div>
        <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full opacity-20 animate-bounce delay-700"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Zap className="w-12 h-12 text-yellow-500 animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
              Story Point Showdown!
            </h1>
            <Zap className="w-12 h-12 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-xl text-gray-700 mb-6 font-medium">Master story point estimation through hilarious user stories</p>
          
          {/* Progress Section */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-600">Story {currentStoryIndex + 1} of {stories.length}</span>
            </div>
            <Progress value={progress} className="h-3 bg-white/50" />
          </div>
          
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
            <Target className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Fibonacci Scale: 1, 2, 3, 5, 8, 13, 20</span>
          </div>
        </div>

        {message && (
          <div className="mb-6 max-w-md mx-auto">
            <div className="p-4 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 text-amber-800 rounded-2xl text-center shadow-lg animate-fade-in">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">{message}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" />
              Let's Estimate These Stories!
              <Star className="w-8 h-8 text-yellow-500" />
            </h2>
          </div>
          
          <Card className="shadow-2xl relative overflow-hidden border-0 bg-gradient-to-br from-white to-purple-50/50 backdrop-blur-sm">
            {showFeedback && (
              <div className={`absolute inset-0 z-20 flex items-center justify-center ${
                isCorrect ? 'bg-gradient-to-br from-green-500/95 to-emerald-600/95' : 'bg-gradient-to-br from-red-500/95 to-pink-600/95'
              } animate-fade-in backdrop-blur-sm`}>
                <div className="text-center">
                  <div className={`text-6xl md:text-8xl font-black text-white animate-scale-in mb-4 ${
                    isCorrect ? 'drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  }`}>
                    {isCorrect ? '🎉 CORRECT!' : '❌ INCORRECT!'}
                  </div>
                  <div className="text-xl text-white/90 font-medium">
                    {isCorrect ? 'Amazing estimation skills!' : 'Better luck next time!'}
                  </div>
                </div>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Badge variant="outline" className="text-lg px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200 text-purple-700 font-semibold">
                  Story #{currentStory.id}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-xl leading-relaxed bg-gradient-to-br from-gray-50 to-blue-50/50 p-8 rounded-2xl border border-gray-100 shadow-inner">
                <div className="text-3xl mb-4 text-center">📖</div>
                <p className="text-gray-800 font-medium text-center">{currentStory.text}</p>
              </div>

              {!hasSubmitted ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">What's your estimate?</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                    <Select value={selectedEstimate} onValueChange={setSelectedEstimate}>
                      <SelectTrigger className="w-full sm:w-64 h-14 text-lg border-2 border-purple-200 focus:border-purple-400 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                        <SelectValue placeholder="Choose your points..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-md border-purple-200 rounded-2xl shadow-2xl">
                        {[1, 2, 3, 5, 8, 13, 20].map((point) => (
                          <SelectItem 
                            key={point} 
                            value={point.toString()}
                            className="text-lg py-3 hover:bg-purple-50 focus:bg-purple-100 rounded-xl m-1"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-purple-600">{point}</span>
                              <span className="text-gray-600">points</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleEstimateSubmit}
                      className="h-14 px-12 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-200 rounded-2xl"
                    >
                      <Target className="w-6 h-6 mr-2" />
                      Submit Estimate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg">
                      <Trophy className="w-6 h-6" />
                      <span className="text-xl font-bold">Actual: {currentStory.actualPoints} Story Points</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-8 rounded-2xl shadow-lg">
                    <h4 className="font-bold text-blue-800 mb-6 text-xl flex items-center gap-2">
                      <Sparkles className="w-6 h-6" />
                      Why {currentStory.actualPoints} Story Points?
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/70 p-4 rounded-xl">
                        <div className="font-semibold text-blue-700 mb-2">💪 Effort:</div>
                        <div className="text-gray-700">{currentStory.reasoning.effort}</div>
                      </div>
                      <div className="bg-white/70 p-4 rounded-xl">
                        <div className="font-semibold text-purple-700 mb-2">🧩 Complexity:</div>
                        <div className="text-gray-700">{currentStory.reasoning.complexity}</div>
                      </div>
                      <div className="bg-white/70 p-4 rounded-xl">
                        <div className="font-semibold text-red-700 mb-2">⚠️ Risk:</div>
                        <div className="text-gray-700">{currentStory.reasoning.risk}</div>
                      </div>
                      <div className="bg-white/70 p-4 rounded-xl">
                        <div className="font-semibold text-yellow-700 mb-2">❓ Uncertainty:</div>
                        <div className="text-gray-700">{currentStory.reasoning.uncertainty}</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button 
                      onClick={handleNextStory}
                      className="h-14 px-12 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all duration-200 rounded-2xl"
                    >
                      {currentStoryIndex < stories.length - 1 ? (
                        <>
                          <Zap className="w-6 h-6 mr-2" />
                          Next Story
                        </>
                      ) : (
                        <>
                          <Trophy className="w-6 h-6 mr-2" />
                          Finish Game
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Creator Info */}
      <div className="fixed bottom-6 right-6 flex items-center space-x-3 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/20">
        <img 
          src="/lovable-uploads/b9b68e3c-3716-490e-974f-7467ff3c8d5a.png"
          alt="Creator"
          className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200"
          onError={(e) => {
            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='%236b7280' font-family='sans-serif' font-size='16'%3ESP%3C/text%3E%3C/svg%3E";
          }}
        />
        <span className="text-sm text-gray-700 font-medium">
          Created by{' '}
          <a 
            href="https://www.linkedin.com/in/sai-shekar-peddi-368333a6/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 font-semibold hover:underline transition-colors"
          >
            Sai Shekar Peddi
          </a>
        </span>
      </div>
    </div>
  );
};

export default Index;
