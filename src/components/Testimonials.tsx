import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      quote: "PeptiSync has completely transformed how I manage my peptide protocols. The tracking is intuitive and the reminders keep me on schedule.",
      author: "Sarah Mitchell",
      role: "Biohacker & Wellness Coach",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
    },
    {
      quote: "As someone managing multiple peptides, this app is a game-changer. The analytics help me understand what's working and optimize my stack.",
      author: "Michael Chen",
      role: "Performance Athlete",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
    },
    {
      quote: "The vendor price tracker alone is worth it. I've saved hundreds of dollars by finding the best deals. Plus, the protocol library is incredibly helpful.",
      author: "Jessica Rodriguez",
      role: "Longevity Enthusiast",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-wellness-blue-50 to-wellness-green-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-wellness-green-500 to-wellness-blue-500 px-4 py-2 rounded-full mb-6 shadow-md"
          >
            <Star className="w-4 h-4 text-white fill-white" />
            <span className="text-sm font-bold text-white">Testimonials</span>
          </motion.div>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
            Loved by{" "}
            <span className="bg-gradient-to-r from-wellness-green-600 to-wellness-blue-600 bg-clip-text text-transparent">
              peptide users
            </span>
          </h2>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
            Join thousands of users who are optimizing their peptide protocols with PeptiSync
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -5,
                transition: { type: "spring", stiffness: 300 }
              }}
              className="bg-white p-8 rounded-2xl shadow-large hover:shadow-xl transition-all border border-gray-100"
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <Quote className="w-10 h-10 text-wellness-green-300" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-500 fill-yellow-500"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-800 mb-6 leading-relaxed font-medium">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <motion.img
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-600">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">4.9/5</span>
              <span>Average Rating</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-300" />
            <div>
              <span className="font-semibold">2,500+</span>
              <span> Active Users</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-300" />
            <div>
              <span className="font-semibold">50,000+</span>
              <span> Protocols Tracked</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
