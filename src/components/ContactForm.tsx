import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Send, User, MessageSquare } from "lucide-react";
import { ref, push } from 'firebase/database';
import { getFirebaseDatabase, isFirebaseAvailable } from '@/lib/firebase';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!formData.subject.trim()) {
      toast.error("Please enter a subject");
      return false;
    }
    if (!formData.message.trim()) {
      toast.error("Please enter a message");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Store submission in Firebase
      if (isFirebaseAvailable()) {
        const database = getFirebaseDatabase();
        if (database) {
          const submissionsRef = ref(database, 'contactSubmissions');
          await push(submissionsRef, {
            ...formData,
            timestamp: Date.now(),
            status: 'new',
          });
        }
      }

      // TODO: Send email via Supabase Edge Function
      // For now, we'll just show success message
      toast.success("Message sent successfully!", {
        description: "We'll get back to you as soon as possible.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Contact form submission error:", error);
      toast.error("Failed to send message", {
        description: "Please try again or email us directly at support@peptisync.com",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-wellness-green-50 to-wellness-coral-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-wellness-green-500 to-wellness-coral-500 px-4 py-2 rounded-full mb-6 shadow-md"
          >
            <Mail className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">Get in Touch</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
            Contact{" "}
            <span className="bg-gradient-to-r from-wellness-green-600 to-wellness-coral-600 bg-clip-text text-transparent">
              Support
            </span>
          </h2>

          <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
            Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-large p-8 md:p-12 border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Name *
              </Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email *
              </Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Subject Field */}
            <div>
              <Label htmlFor="subject" className="text-gray-700 font-medium">
                Subject *
              </Label>
              <div className="relative mt-2">
                <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Message Field */}
            <div>
              <Label htmlFor="message" className="text-gray-700 font-medium">
                Message *
              </Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your inquiry..."
                rows={6}
                className="mt-2 resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-wellness-green-600 to-wellness-blue-600 hover:from-wellness-green-700 hover:to-wellness-blue-700 text-white py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>

          {/* Contact Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-700 font-medium">
              Or email us directly at{" "}
              <a
                href="mailto:support@peptisync.com"
                className="text-wellness-green-600 hover:text-wellness-green-700 font-bold underline"
              >
                support@peptisync.com
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
