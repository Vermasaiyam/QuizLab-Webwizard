import { motion } from 'framer-motion';

const images = [
  'about1.jpeg',
  'about2.jpeg',
  'about3.jpeg',
  'about4.jpg',
];

const FloatingCarousel = () => {
  return (
    <div className="overflow-hidden w-full relative mt-40">
      <motion.div
        className="flex space-x-8 w-max"
        animate={{ x: ['0%', '-100%'] }}
        transition={{ repeat: Infinity, duration: 35, ease: 'linear' }}
      >
        {[...images, ...images, ...images, ...images, ...images, ...images, ...images, ...images, ...images, ...images,].map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`about${index}`}
            className="w-40 h-40 rounded-xl shadow-lg object-cover"
          />
        ))}
      </motion.div>
    </div>
  );
};

export default FloatingCarousel;
