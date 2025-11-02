import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, Tag, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const ShopTeaser = () => {
  const categories = [
    {
      icon: Tag,
      title: "Custom Labels",
      description: "Professional peptide vial labels",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop"
    },
    {
      icon: Package,
      title: "Storage Cases",
      description: "Premium peptide storage solutions",
      image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&h=300&fit=crop"
    },
    {
      icon: Sparkles,
      title: "Accessories",
      description: "Essential peptide accessories",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
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
            className="inline-flex items-center gap-2 bg-gradient-to-r from-wellness-coral-500 to-wellness-green-500 px-4 py-2 rounded-full mb-6 shadow-md"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">Shop</span>
          </motion.div>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
            Everything you need for{" "}
            <span className="bg-gradient-to-r from-wellness-coral-600 to-wellness-green-600 bg-clip-text text-transparent">
              peptide management
            </span>
          </h2>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
            From custom labels to premium storage cases, we've got you covered
          </p>
        </motion.div>

        {/* Category Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          {categories.map((category, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -10,
                transition: { type: "spring", stiffness: 300 }
              }}
              className="group relative bg-white rounded-2xl shadow-large hover:shadow-xl transition-all overflow-hidden border border-gray-100"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                
                {/* Icon */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-wellness-green-500 to-wellness-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <category.icon className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-700 font-medium">
                  {category.description}
                </p>
              </div>

              {/* Hover Effect */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-wellness-green-500/10 to-wellness-coral-500/10 pointer-events-none"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center"
        >
          <Link to="/store">
            <Button
              size="lg"
              className="bg-gradient-to-r from-wellness-green-600 to-wellness-blue-600 hover:from-wellness-green-700 hover:to-wellness-blue-700 text-white px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Visit Shop
            </Button>
          </Link>
          <p className="mt-4 text-gray-700 font-semibold">
            Free shipping on orders over $50 • 30-day returns
          </p>
        </motion.div>

        {/* Featured Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                New: Premium Starter Kit
              </h3>
              <p className="text-gray-600 text-lg">
                Everything you need to get started with peptide tracking
              </p>
            </div>
            <Link to="/store">
              <Button
                variant="outline"
                size="lg"
                className="border-primary-600 text-primary-600 hover:bg-primary-50"
              >
                Shop Now
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ShopTeaser;
