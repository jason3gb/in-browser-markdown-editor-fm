const imageContext = require.context('./assets', false, /\.(png|jpe?g|svg)$/);

// images.keys() will give you an array of all matching filenames.
const images = imageContext.keys().reduce((images, path) => {
  // The following line will dynamically import images
  images[path] = imageContext(path);
  return images;
}, {});

export default images;