
const ANIMATION_DELAY = {
  CHAT_STAGGER: 150, // ms between each chat message animation
  INITIAL_BUFFER: 100 // ms before first animation starts
};

/**
 * Sets up the animation observer for elements
 * @param {string[]} selectors - Array of CSS selectors to observe
 * @param {boolean} unobserveAfter - Whether to stop observing after first trigger
 * @returns {IntersectionObserver} The created observer
 */
export const setupAnimationObserver = (selectors = ['.animate-on-scroll'], unobserveAfter = false) => {
  if (typeof window === 'undefined') return null;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          if (unobserveAfter) {
            observer.unobserve(entry.target);
          }
        }
      });
    },
    { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  // Observe all matching elements
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el) => {
      el.classList.remove('animate-fade-in');
      observer.observe(el);
    });
  });

  return observer;
};

/**
 * Sets up staggered animation for chat messages with smooth sequencing
 * @param {string} containerSelector - Selector for chat container
 * @returns {Function} Cleanup function to reset animations
 */
export const setupChatAnimations = (containerSelector = '.chat-messages') => {
  if (typeof window === 'undefined') return () => {};

  const chatContainer = document.querySelector(containerSelector);
  if (!chatContainer) return () => {};

  const chatMessages = Array.from(chatContainer.querySelectorAll('.chat-message'));

  // Animate messages with stagger
  chatMessages.forEach((message, index) => {
    setTimeout(() => {
      message.classList.add('animate-fade-in');
    }, ANIMATION_DELAY.INITIAL_BUFFER + (index * ANIMATION_DELAY.CHAT_STAGGER));
  });

  // Return cleanup function
  return () => {
    chatMessages.forEach(message => {
      message.classList.remove('animate-fade-in');
    });
  };
};

/**
 * Cleans up the animation observer
 * @param {IntersectionObserver} observer - Observer instance to clean up
 */
export const cleanupAnimationObserver = (observer) => {
  if (observer) {
    observer.disconnect();
  }
};

/**
 * Initialize all animations with default settings
 */
export const initAnimations = () => {
  const observer = setupAnimationObserver([
    '.animate-on-scroll',
    '.chat-message',
    '.chat-bubble'
  ]);
  
  const cleanupChat = setupChatAnimations();
  
  return () => {
    cleanupAnimationObserver(observer);
    cleanupChat();
  };
};

// Auto-initialize when in browser environment
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    setTimeout(initAnimations, 0);
  } else {
    document.addEventListener('DOMContentLoaded', initAnimations);
  }
}