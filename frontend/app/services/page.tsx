"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { 
  Brain, 
  Globe, 
  Smartphone, 
  Zap, 
  Bot, 
  Code, 
  Database, 
  Cloud,
  CheckCircle2,
  Send,
  Sparkles
} from "lucide-react";

export default function ServicesPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const services = [
    {
      icon: Brain,
      title: "AI Products & Solutions",
      description: "Custom AI solutions tailored to your business needs. From intelligent chatbots to predictive analytics, we build AI that works for you.",
      features: [
        "Custom AI development",
        "Machine Learning models",
        "Natural Language Processing",
        "Computer Vision solutions",
        "AI consulting & strategy",
      ],
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Globe,
      title: "Website Development",
      description: "Modern, responsive websites that convert. We build fast, SEO-optimized websites using the latest technologies.",
      features: [
        "Responsive web design",
        "E-commerce solutions",
        "CMS integration",
        "SEO optimization",
        "Performance optimization",
      ],
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Smartphone,
      title: "App Development",
      description: "Native and cross-platform mobile applications for iOS and Android. From concept to App Store, we've got you covered.",
      features: [
        "iOS & Android apps",
        "React Native development",
        "Flutter applications",
        "App Store optimization",
        "Maintenance & support",
      ],
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Zap,
      title: "AI Automation",
      description: "Streamline your business processes with intelligent automation. Reduce manual work and increase efficiency.",
      features: [
        "Workflow automation",
        "Process optimization",
        "Integration services",
        "Custom automation tools",
        "ROI tracking & analytics",
      ],
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: Bot,
      title: "AI Agents & Assistants",
      description: "Intelligent virtual assistants and chatbots that handle customer service, lead generation, and more.",
      features: [
        "Chatbot development",
        "Virtual assistants",
        "Customer service bots",
        "Lead generation agents",
        "24/7 automated support",
      ],
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      icon: Code,
      title: "Custom Software Development",
      description: "Bespoke software solutions designed specifically for your business requirements and workflows.",
      features: [
        "Enterprise software",
        "API development",
        "Microservices architecture",
        "Cloud-native solutions",
        "Legacy system modernization",
      ],
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: `Service Inquiry: ${formData.service || 'General'}`,
          message: `Company: ${formData.company || 'N/A'}\nService Interest: ${formData.service || 'General'}\n\nMessage:\n${formData.message}`,
          to: 'synkspace.io@gmail.com',
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ name: "", email: "", company: "", service: "", message: "" });
      } else {
        alert('Failed to send message. Please try again or email us directly at synkspace.io@gmail.com');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please email us directly at synkspace.io@gmail.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <div className="mb-4 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-4xl font-bold md:text-5xl">
            Services by <span className="text-[#9AB973]">SynkSpace</span>
          </h1>
        </div>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Transform your business with cutting-edge technology solutions. From AI products to custom software development, 
          we deliver solutions that drive results.
        </p>
      </motion.div>

      {/* Services Grid */}
      <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow border-2">
              <CardHeader>
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${service.bgColor}`}>
                  <service.icon className={`h-6 w-6 ${service.color}`} />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription className="text-base">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start space-x-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Why Choose SynkSpace */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-16"
      >
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Why Choose SynkSpace?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white">
                  <Code className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Expert Team</h3>
                <p className="text-muted-foreground">
                  Experienced developers and AI specialists dedicated to delivering excellence
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Fast Delivery</h3>
                <p className="text-muted-foreground">
                  Agile development process ensuring timely delivery without compromising quality
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white">
                  <Cloud className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Scalable Solutions</h3>
                <p className="text-muted-foreground">
                  Future-proof solutions that grow with your business needs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-8"
      >
        <Card className="border-2 border-[#556B2F]">
          <CardHeader>
            <CardTitle className="text-3xl text-center">
              Interested in Working With Us?
            </CardTitle>
            <CardDescription className="text-center text-base">
              Fill out the form below and we'll get back to you within 24 hours to discuss your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center py-12">
                <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" />
                <h3 className="mb-2 text-2xl font-bold">Message Sent Successfully!</h3>
                <p className="mb-6 text-muted-foreground">
                  We've received your inquiry and will get back to you within 24 hours.
                </p>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-[#556B2F] hover:bg-[#6B7F3F]"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@company.com"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Your Company"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="service">Service Interest *</Label>
                    <select
                      id="service"
                      required
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
                    >
                      <option value="">Select a service</option>
                      <option value="AI Products & Solutions">AI Products & Solutions</option>
                      <option value="Website Development">Website Development</option>
                      <option value="App Development">App Development</option>
                      <option value="AI Automation">AI Automation</option>
                      <option value="AI Agents & Assistants">AI Agents & Assistants</option>
                      <option value="Custom Software Development">Custom Software Development</option>
                      <option value="Multiple Services">Multiple Services</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Project Details *</Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your project, requirements, timeline, and budget..."
                    rows={6}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-center">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="bg-[#556B2F] hover:bg-[#6B7F3F] text-white min-w-[200px]"
                  >
                    {isSubmitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Inquiry
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Or contact us directly:{" "}
                  <a href="mailto:synkspace.io@gmail.com" className="text-primary hover:underline">
                    synkspace.io@gmail.com
                  </a>
                  {" "}|{" "}
                  <a href="https://wa.me/923143796943" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    +92 314 3796943
                  </a>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
