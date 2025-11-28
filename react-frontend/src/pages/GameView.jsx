import React from "react";
import { useNavigate } from "react-router-dom";
import { useGameSetup } from "../context/GameSetupContext";

// Import dialog arrays with IDs
import { easyDialogs } from "../assets/dialogues/easy_dialog.js";
import { mediumDialogs } from "../assets/dialogues/medium_dialog.js";
import { hardDialogs } from "../assets/dialogues/hard_dialog.js";

// Import background assets
import studyGroupVideo from "../assets/game_settings/study_group.mp4";
import meetingVideo from "../assets/game_settings/meeting.mp4";
import audienceVideo from "../assets/game_settings/audience.mp4";

// Import heckler images
import easyStart from "../assets/heckler/easy_sandra/start.png";
import mediumStart from "../assets/heckler/medium_ally/start.png";
import hardStart from "../assets/heckler/hard_alex/start.png";

// Import dialogue bubble
import dialogueBubble from "../assets/dialogue_bubble.png";

// Glob import all heckler images for dynamic loading
const hecklerImagesGlob = import.meta.glob("../assets/heckler/**/*.png", { eager: true });

// Map settings to background assets with type info
const settingBackgrounds = {
  study_group: { src: studyGroupVideo, isVideo: true },
  meeting: { src: meetingVideo, isVideo: true },
  audience: { src: audienceVideo, isVideo: true },
};

// Map heckler levels to start images
const hecklerImages = {
  easy: easyStart,
  medium: mediumStart,
  hard: hardStart,
};

// Map settings to heckler style configurations
const hecklerStyles = {
  study_group: {
    top: "30%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "52%",
    maxHeight: "70%",
    objectFit: "contain",
    clipPath: "inset(0 0 1% 0)",
    WebkitClipPath: "inset(0 0 1% 0)",
  },
  meeting: {
    // Different settings for each heckler level
    easy: {
      top: "32%",
      left: "65%",
      transform: "translate(-50%, -50%) rotate(2deg)",
      maxWidth: "89%",
      maxHeight: "84%",
      objectFit: "contain",
      clipPath: "inset(0 0 13% 0)",
      WebkitClipPath: "inset(0 0 13% 0)",
    },
    medium: {
      // Add your medium heckler settings for meeting here
      top: "35%",
      left: "65%",
      transform: "translate(-50%, -50%) rotate(2deg)",
      maxWidth: "89%",
      maxHeight: "84%",
      objectFit: "contain",
      clipPath: "inset(0 0 17% 0)",
      WebkitClipPath: "inset(0 0 17% 0)",
    },
    hard: {
      // Add your hard heckler settings for meeting here
      top: "36%",
      left: "65%",
      transform: "translate(-50%, -50%) rotate(2deg)",
      maxWidth: "89%",
      maxHeight: "84%",
      objectFit: "contain",
      clipPath: "inset(0 0 18% 0)",
      WebkitClipPath: "inset(0 0 18% 0)",
    },
  },
  audience: {
    // Add your audience settings here
    top: "44.5%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "70%",
    maxHeight: "90%",
    objectFit: "contain",
    clipPath: "inset(0 0 7% 0)",
    WebkitClipPath: "inset(0 0 7% 0)",
  },
};

// Map settings to dialog bubble position configurations
const dialogBubblePositions = {
  study_group: {
    top: "3%",
    left: "58%",
  },
  meeting: {
    top: "2%",
    left: "73%",
  },
  audience: {
    top: "10%",
    left: "60%",
  },
};

function GameView() {
  const navigate = useNavigate();
  const { selections } = useGameSetup();
  const [showBackground, setShowBackground] = React.useState(false);
  const [showHeckler, setShowHeckler] = React.useState(false);
  const [showReminder, setShowReminder] = React.useState(false);
  const [showCountdown, setShowCountdown] = React.useState(false);
  const [countdown, setCountdown] = React.useState(3);
  const [startTimer, setStartTimer] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState(180); // 3 minutes in seconds
  const [dialogs, setDialogs] = React.useState([]);
  const [currentDialog, setCurrentDialog] = React.useState(null);
  const [currentHecklerImage, setCurrentHecklerImage] = React.useState(null);
  const [showDialog, setShowDialog] = React.useState(false);
  const [hecklerAnimation, setHecklerAnimation] = React.useState(null);
  const [animationKey, setAnimationKey] = React.useState(0); // Key to force re-render and restart animation
  const usedDialogIdsRef = React.useRef(new Set());
  const dialogTimerRef = React.useRef(null);

  // Redirect if selections are incomplete
  React.useEffect(() => {
    if (!selections.topic || !selections.setting || !selections.heckler) {
      navigate("/game/topic", { replace: true });
    }
  }, [navigate, selections]);

  // Trigger dissolve animation for background (faster)
  React.useEffect(() => {
    if (selections.setting) {
      // Very short delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowBackground(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selections.setting]);

  // Trigger dissolve animation for heckler image (slower, after background)
  React.useEffect(() => {
    if (selections.heckler) {
      // Delay to ensure background appears first
      const timer = setTimeout(() => {
        setShowHeckler(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selections.heckler]);

  // Show reminder and countdown after both background and heckler are visible
  React.useEffect(() => {
    if (showBackground && showHeckler) {
      // Wait for animations to complete (background: 0.5s, heckler: 1s, so wait 1.5s total)
      const showReminderTimer = setTimeout(() => {
        setShowReminder(true);
      }, 1500);
      
      // Show countdown after reminder (2 seconds) - total 3.5s after animations
      const showCountdownTimer = setTimeout(() => {
        setShowReminder(false);
        setShowCountdown(true);
        setCountdown(3);
      }, 6500);
      
      return () => {
        clearTimeout(showReminderTimer);
        clearTimeout(showCountdownTimer);
      };
    }
  }, [showBackground, showHeckler]);

  // Handle countdown (3, 2, 1, GO!)
  React.useEffect(() => {
    if (showCountdown) {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          if (countdown > 1) {
            setCountdown(countdown - 1);
          } else {
            // Show "GO!" for 0.5 seconds, then start timer
            setTimeout(() => {
              setShowCountdown(false);
              setStartTimer(true);
            }, 500);
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [showCountdown, countdown]);

  // Timer countdown - start only after countdown completes
  React.useEffect(() => {
    if (startTimer && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [startTimer, timeRemaining]);

  // Function to get heckler image path dynamically
  const getHecklerImage = React.useCallback((imageName) => {
    if (!imageName || !selections.heckler) return null;
    
    const hecklerFolders = {
      easy: "easy_sandra",
      medium: "medium_ally",
      hard: "hard_alex",
    };
    
    const folder = hecklerFolders[selections.heckler];
    if (!folder) return null;
    
    // Construct the path and look it up in the glob import
    const imagePath = `../assets/heckler/${folder}/${imageName}`;
    const imageModule = hecklerImagesGlob[imagePath];
    
    if (imageModule) {
      return imageModule.default || imageModule;
    }
    
    console.warn(`Heckler image not found: ${imagePath}`);
    return null;
  }, [selections.heckler]);

  // Load dialogs based on heckler level
  React.useEffect(() => {
    if (selections.heckler) {
      const dialogMap = {
        easy: easyDialogs,
        medium: mediumDialogs,
        hard: hardDialogs,
      };
      
      const dialogs = dialogMap[selections.heckler];
      if (dialogs) {
        setDialogs(dialogs);
      }
    }
  }, [selections.heckler]);

  // Show first dialog as opening when timer starts, then random dialogs every 20 seconds
  React.useEffect(() => {
    if (startTimer && dialogs.length > 0) {
      // Clear any existing timers
      if (dialogTimerRef.current) {
        clearTimeout(dialogTimerRef.current);
      }
      
      // Reset used dialog IDs when timer starts
      usedDialogIdsRef.current = new Set([dialogs[0].id]); // Mark first dialog as used
      
      // Show first dialog immediately (opening dialog)
      setCurrentDialog(dialogs[0]);
      // Update heckler image based on first dialog
      const firstHecklerImage = getHecklerImage(dialogs[0].image);
      if (firstHecklerImage) {
        // Trigger animation when image changes
        const animations = ["shock"];
        const randomAnim = animations[Math.floor(Math.random() * animations.length)];
        setHecklerAnimation(randomAnim);
        setAnimationKey(prev => prev + 1);
        setCurrentHecklerImage(firstHecklerImage);
      }
      setShowDialog(true);
      
      // Hide first dialog after 8 seconds
      const hideFirstDialog = setTimeout(() => {
        setShowDialog(false);
        
        // After first dialog, wait 12 more seconds (total 20 seconds from start)
        // Then start showing random dialogs every 20 seconds
        const startRandomDialogs = setTimeout(() => {
          const showNextRandom = () => {
            if (dialogs.length > 1) {
              // Get available dialogs (excluding first dialog and already used ones)
              const availableDialogs = dialogs.slice(1).filter(
                (dialog) => !usedDialogIdsRef.current.has(dialog.id)
              );
              
              let selectedDialog;
              
              // If all dialogs have been used, reset the used set (except first dialog)
              if (availableDialogs.length === 0) {
                // Reset: all dialogs except first are available again
                usedDialogIdsRef.current = new Set([dialogs[0].id]);
                const allDialogsExceptFirst = dialogs.slice(1);
                const randomIndex = Math.floor(Math.random() * allDialogsExceptFirst.length);
                selectedDialog = allDialogsExceptFirst[randomIndex];
              } else {
                // Select random dialog from available ones
                const randomIndex = Math.floor(Math.random() * availableDialogs.length);
                selectedDialog = availableDialogs[randomIndex];
              }
              
              // Mark this dialog as used
              usedDialogIdsRef.current.add(selectedDialog.id);
              
              setCurrentDialog(selectedDialog);
              // Update heckler image based on selected dialog
              const hecklerImage = getHecklerImage(selectedDialog.image);
              if (hecklerImage) {
              // Trigger random animation when image changes
              const animations = ["shock"];
              const randomAnim = animations[Math.floor(Math.random() * animations.length)];
                setHecklerAnimation(randomAnim);
                setAnimationKey(prev => prev + 1); // Force animation restart
                setCurrentHecklerImage(hecklerImage);
              }
              setShowDialog(true);
              
              // Hide dialog after 3 seconds
              const hideTimer = setTimeout(() => {
                setShowDialog(false);
                // Schedule next random dialog after 20 seconds total (17 seconds wait + 3 seconds shown)
                dialogTimerRef.current = setTimeout(showNextRandom, 12000);
              }, 8000);
              
              dialogTimerRef.current = hideTimer;
            }
          };
          
          showNextRandom();
        }, 12000); // 12 seconds after first dialog ends (20 seconds total from start: 8s shown + 12s wait)
        
        dialogTimerRef.current = startRandomDialogs;
      }, 8000);
      
      return () => {
        clearTimeout(hideFirstDialog);
        if (dialogTimerRef.current) {
          clearTimeout(dialogTimerRef.current);
        }
      };
    }
  }, [startTimer, dialogs]);

  // Cleanup dialog timer on unmount
  React.useEffect(() => {
    return () => {
      if (dialogTimerRef.current) {
        clearTimeout(dialogTimerRef.current);
      }
    };
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get background source based on setting
  const background = selections.setting
    ? settingBackgrounds[selections.setting]
    : null;
  const backgroundSrc = background?.src;
  const isVideo = background?.isVideo ?? false;

  // Get heckler image source based on heckler level (start image)
  const startHecklerImageSrc = selections.heckler
    ? hecklerImages[selections.heckler]
    : null;
  
  // Use current dialog's heckler image if available, otherwise use start image
  const hecklerImageSrc = currentHecklerImage || startHecklerImageSrc;
  
  // Initialize heckler image with start image when game starts
  React.useEffect(() => {
    if (startHecklerImageSrc && !currentHecklerImage) {
      setCurrentHecklerImage(startHecklerImageSrc);
    }
  }, [startHecklerImageSrc, currentHecklerImage]);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      {/* Background - Video or Image with Dissolve Animation */}
      {backgroundSrc && isVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
            opacity: showBackground ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
        >
          <source src={backgroundSrc} type="video/mp4" />
        </video>
      ) : backgroundSrc ? (
        <img
          src={backgroundSrc}
          alt="Game background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
            opacity: showBackground ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
        />
      ) : null}

      {/* Heckler Image - Centered with Dissolve Animation */}
      {hecklerImageSrc && (() => {
        // Get the appropriate style based on setting and heckler level
        let styleConfig = null;
        if (selections.setting && hecklerStyles[selections.setting]) {
          const settingStyle = hecklerStyles[selections.setting];
          // Check if this setting has per-heckler configurations (like meeting)
          if (selections.heckler && settingStyle[selections.heckler]) {
            styleConfig = settingStyle[selections.heckler];
          } else if (!settingStyle.easy && !settingStyle.medium && !settingStyle.hard) {
            // It's a flat configuration (like study_group, audience)
            styleConfig = settingStyle;
          } else {
            // Fallback to easy if heckler-specific config exists but current heckler not found
            styleConfig = settingStyle.easy || hecklerStyles.study_group;
          }
        } else {
          // Default to study_group if setting not found
          styleConfig = hecklerStyles.study_group;
        }

        // Get animation style based on current animation type
        const getAnimationStyle = () => {
          if (!hecklerAnimation) return {};
          
          const animationMap = {
            shock: "hecklerShock 0.4s ease-out",
          };
          
          return {
            animation: animationMap[hecklerAnimation] || "",
          };
        };

        // Get animation style based on current animation type
        const animationStyle = getAnimationStyle();
        
        // Extract transform and other positioning styles
        const { transform, top, left, ...imageStyles } = styleConfig;

        return (
          <div
            style={{
              position: "absolute",
              top: top,
              left: left,
              transform: transform,
              zIndex: 2,
              opacity: showHeckler ? 1 : 0,
              transition: "opacity 1s ease-in-out",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              key={animationKey} // Force re-render to restart animation
              src={hecklerImageSrc}
              alt="Heckler"
              style={{
                ...imageStyles,
                display: "block",
                ...animationStyle,
                filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5))",
                WebkitFilter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5))",
              }}
            />
          </div>
        );
      })()}

      {/* Reminder and Countdown Overlay */}
      {(showReminder || showCountdown) && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.9)", // Dark transparent overlay
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.3s ease-in",
          }}
        >
          {showReminder && (
            <div
              style={{
                textAlign: "center",
                maxWidth: "800px",
                padding: "2rem",
                animation: "fadeInScale 0.5s ease-out",
              }}
            >
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  marginBottom: "2rem",
                  color: "#55f991",
                  letterSpacing: "0.05em",
                }}
              >
                Game Reminder
              </h1>
              <div
                style={{
                  fontSize: "1.3rem",
                  lineHeight: "1.8",
                  letterSpacing: "0.02em",
                  color: "#ffffff",
                  opacity: 0.95,
                }}
              >
                <p style={{ marginBottom: "1.5rem" }}>
                  Whatever happens, remember to <strong>keep continuing your speech</strong>.
                </p>
                <p style={{ marginBottom: "1.5rem" }}>
                  <strong>Keep calm</strong> and <strong>maintain composure</strong> to tackle the heckler.
                </p>
                <p style={{ marginTop: "2rem", fontSize: "1.5rem", color: "#55f991" }}>
                  Good luck!
                </p>
              </div>
            </div>
          )}

          {showCountdown && (
            <div
              style={{
                fontSize: "8rem",
                fontWeight: 700,
                color: countdown === 0 ? "#55f991" : "#55f991",
                textShadow: "0 0 40px rgba(85, 249, 145, 0.8)",
                animation: "scaleIn 0.5s ease-out",
                fontFamily: "monospace",
              }}
            >
              {countdown > 0 ? countdown : "GO!"}
            </div>
          )}
        </div>
      )}

      {/* Timer Display */}
      {startTimer && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "30px",
            zIndex: 10,
            backgroundColor: "rgb(11, 11, 22)",
            padding: "15px 25px",
            borderRadius: "12px",
            border: "2px solid rgba(85, 249, 145, 0.5)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
            animation: timeRemaining <= 10 
              ? "fadeIn 0.8s ease-out, timerShake 0.5s infinite" 
              : "fadeIn 0.8s ease-out",
          }}
        >
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              color: timeRemaining <= 30 ? "#ff4444" : "#55f991",
              fontFamily: "monospace",
              letterSpacing: "0.1em",
              textShadow: "0 0 10px rgba(85, 249, 145, 0.5)",
              transition: "color 0.3s ease",
            }}
          >
            {formatTime(timeRemaining)}
          </div>
        </div>
      )}

      {/* Dialog Display with Speech Bubble */}
      {showDialog && currentDialog && (() => {
        const bubblePosition = selections.setting && dialogBubblePositions[selections.setting]
          ? dialogBubblePositions[selections.setting]
          : dialogBubblePositions.study_group;
        
        return (
          <div
            style={{
              position: "absolute",
              ...bubblePosition,
              zIndex: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              animation: "bubblePopUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            }}
          >
          {/* Speech Bubble Image */}
          <div
            style={{
              position: "relative",
              width: "330px",
              height: "200px",
              backgroundImage: `url(${dialogueBubble})`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Dialog Text */}
            <div
              style={{
                fontSize: "1.6rem",
                fontWeight: 500,
                fontFamily: "'Fredoka', sans-serif",
                color: "#545454",
                lineHeight: "1.2",
                textAlign: "center",
                letterSpacing: "0.01em",
                wordWrap: "break-word",
                width: "calc(100% - 110px)",
                maxHeight: "130px",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 5,
                WebkitBoxOrient: "vertical",
                textOverflow: "ellipsis",
                margin: "-20px auto 0 auto",
                justifyContent: "center",
                WebkitBoxPack: "center",
              }}
            >
              {currentDialog?.text || currentDialog}
            </div>
          </div>
        </div>
        );
      })()}

      <style>{`
        @keyframes bubblePopUp {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(30px);
          }
          50% {
            transform: scale(1.1) translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Heckler Animation Effects - Applied to image element */
        @keyframes hecklerShock {
          0% {
            transform: scale(1) rotate(0deg);
          }
          10% {
            transform: scale(1.15) rotate(-3deg);
          }
          20% {
            transform: scale(0.95) rotate(3deg);
          }
          30% {
            transform: scale(1.1) rotate(-2deg);
          }
          40% {
            transform: scale(1.05) rotate(2deg);
          }
          50% {
            transform: scale(1.12) rotate(-1deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes timerShake {
          0%, 100% {
            transform: translateX(0);
          }
          10% {
            transform: translateX(-8px) rotate(-2deg);
          }
          20% {
            transform: translateX(8px) rotate(2deg);
          }
          30% {
            transform: translateX(-6px) rotate(-1deg);
          }
          40% {
            transform: translateX(6px) rotate(1deg);
          }
          50% {
            transform: translateX(-4px) rotate(-0.5deg);
          }
          60% {
            transform: translateX(4px) rotate(0.5deg);
          }
          70% {
            transform: translateX(-3px);
          }
          80% {
            transform: translateX(3px);
          }
          90% {
            transform: translateX(-2px);
          }
        }

      `}</style>
    </div>
  );
}

export default GameView;

