
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as Tone from 'tone';

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
        
        // Create audio components
        reverbRef.current = new Tone.Reverb(2).toDestination();
        synthRef.current = new Tone.Synth().connect(reverbRef.current);
        noiseRef.current = new Tone.Noise('brown').toDestination();
        
        setAudioInitialized(true);
      } catch (error) {
        console.error('Audio initialization failed:', error);
      }
    };

    // Initialize audio on first user interaction
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

    // Play sound and voice feedback
    if (correct) {
      playSuccessSound();
      speakFeedback("Fantastic! You got it!");
    } else {
      playFailureSound();
      speakFeedback("Oops! It's wrong!");
    }

    // Hide feedback animation after 2 seconds
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
  const totalActual = stories.slice(0, userEstimates.length).reduce((sum, story) => sum + story.actualPoints, 0);

  if (gameCompleted) {
    const finalTotalActual = stories.reduce((sum, story) => sum + story.actualPoints, 0);
    const difference = Math.abs(totalEstimated - finalTotalActual);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-blue-800 mb-4">Story Point Showdown!</h1>
            <p className="text-lg text-gray-600">Understanding story points through humor and estimation</p>
          </div>

          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-green-600">🎉 Game Complete! 🎉</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-semibold text-blue-800">Your Total</div>
                  <div className="text-2xl font-bold text-blue-600">{totalEstimated}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="font-semibold text-green-800">Actual Total</div>
                  <div className="text-2xl font-bold text-green-600">{finalTotalActual}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="font-semibold text-purple-800">Difference</div>
                  <div className="text-2xl font-bold text-purple-600">{difference}</div>
                </div>
              </div>
              <Button onClick={resetGame} className="mt-6 text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700">
                Start New Game
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Creator Info */}
        <div className="fixed bottom-4 right-4 flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-sm">
          <img 
            src="/lovable-uploads/b9b68e3c-3716-490e-974f-7467ff3c8d5a.png"
            alt="Creator"
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23e5e7eb'/%3E%3Ctext x='16' y='20' text-anchor='middle' fill='%236b7280' font-family='sans-serif' font-size='14'%3ESP%3C/text%3E%3C/svg%3E";
            }}
          />
          <span className="text-sm text-gray-600">
            Created by{' '}
            <a 
              href="https://www.linkedin.com/in/sai-shekar-peddi-368333a6/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Sai Shekar Peddi
            </a>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-800 mb-4">Story Point Showdown!</h1>
          <p className="text-lg text-gray-600 mb-4">Understanding story points through humor and estimation</p>
          <div className="text-sm text-gray-500">
            Fibonacci Scale: 1, 2, 3, 5, 8, 13, 20 • Story {currentStoryIndex + 1} of {stories.length}
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-center">
            {message}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6 text-center">Let's Estimate These Stories!</h2>
          
          <Card className="shadow-lg relative overflow-hidden">
            {showFeedback && (
              <div className={`absolute inset-0 z-10 flex items-center justify-center ${
                isCorrect ? 'bg-green-500/90' : 'bg-red-500/90'
              } animate-fade-in`}>
                <div className={`text-4xl md:text-6xl font-bold text-white animate-scale-in ${
                  isCorrect ? 'text-green-100' : 'text-red-100'
                }`}>
                  {isCorrect ? 'CORRECT!' : 'INCORRECT!'}
                </div>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="text-lg">Story #{currentStory.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg leading-relaxed bg-gray-50 p-4 rounded-lg">
                {currentStory.text}
              </div>

              {!hasSubmitted ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <Select value={selectedEstimate} onValueChange={setSelectedEstimate}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Select estimate" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 5, 8, 13, 20].map((point) => (
                          <SelectItem key={point} value={point.toString()}>
                            {point}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleEstimateSubmit}
                      className="bg-green-600 hover:bg-green-700 px-8"
                    >
                      Submit Estimate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <Badge className="text-lg px-4 py-2 bg-blue-100 text-blue-800">
                      Actual: {currentStory.actualPoints}
                    </Badge>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <h4 className="font-semibold text-blue-800 mb-3">Why {currentStory.actualPoints} Story Points?</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Effort:</strong> {currentStory.reasoning.effort}</div>
                      <div><strong>Complexity:</strong> {currentStory.reasoning.complexity}</div>
                      <div><strong>Risk:</strong> {currentStory.reasoning.risk}</div>
                      <div><strong>Uncertainty:</strong> {currentStory.reasoning.uncertainty}</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button 
                      onClick={handleNextStory}
                      className="bg-blue-600 hover:bg-blue-700 px-8"
                    >
                      {currentStoryIndex < stories.length - 1 ? 'Next Story' : 'Finish Game'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Creator Info */}
      <div className="fixed bottom-4 right-4 flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-sm">
        <img 
          src="/lovable-uploads/b9b68e3c-3716-490e-974f-7467ff3c8d5a.png"
          alt="Creator"
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23e5e7eb'/%3E%3Ctext x='16' y='20' text-anchor='middle' fill='%236b7280' font-family='sans-serif' font-size='14'%3ESP%3C/text%3E%3C/svg%3E";
          }}
        />
        <span className="text-sm text-gray-600">
          Created by{' '}
          <a 
            href="https://www.linkedin.com/in/sai-shekar-peddi-368333a6/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Sai Shekar Peddi
          </a>
        </span>
      </div>
    </div>
  );
};

export default Index;
