// Native stub for react-dom
// @expo/log-box imports react-dom/client for its web error overlay,
// which is not used on native platforms.
module.exports = {
  createRoot: () => ({ render: () => {}, unmount: () => {} }),
  hydrateRoot: () => ({ render: () => {}, unmount: () => {} }),
  render: () => {},
  unmountComponentAtNode: () => false,
}
