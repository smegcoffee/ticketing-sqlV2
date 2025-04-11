// src/RocketChatLivechat.js
import { useEffect } from 'react';

const RocketChatLivechat = () => {
  useEffect(() => {
    // Create the script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'http://localhost:3000/livechat/rocketchat-livechat.min.js?_=201903270000';

    // Insert the script before the first script tag in the document
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag) {
      firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
    }

    // Initialize Rocket.Chat live chat
    const rocketChatInit = () => {
      window.RocketChat = function (c) { window.RocketChat._.push(c) };
      window.RocketChat._ = [];
      window.RocketChat.url = 'http://localhost:3000/livechat';
    };

    rocketChatInit();

    // Cleanup function to remove the script when the component is unmounted
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
};

export default RocketChatLivechat;
