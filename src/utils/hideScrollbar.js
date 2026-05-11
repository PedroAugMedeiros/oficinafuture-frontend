import { Platform } from 'react-native';

export function hideWebScrollbar() {
  if (Platform.OS !== 'web') return;

  if (document.getElementById('__hide-scrollbar-style')) return;

  const style = document.createElement('style');
  style.id = '__hide-scrollbar-style';
  style.textContent = `
    /* Firefox */
    * {
      scrollbar-width: none;
    }

    /* Chrome, Safari, Edge */
    *::-webkit-scrollbar {
      display: none;
    }
  `;
  document.head.appendChild(style);
}
