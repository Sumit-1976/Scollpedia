import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatarUrl?: string;
  content: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Student",
    avatarUrl: "https://randomuser.me/api/portraits/women/32.jpg",
    content: "Scrollpedia has completely transformed how I study. The card format makes complex topics so much easier to understand and remember."
  },
  {
    id: 2,
    name: "David Chen",
    role: "Software Engineer",
    avatarUrl: "https://randomuser.me/api/portraits/men/45.jpg",
    content: "I use Scrollpedia daily to stay updated on tech trends. The bite-sized format fits perfectly into my busy schedule."
  },
  {
    id: 3,
    name: "Melissa Rodriguez",
    role: "Teacher",
    avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg",
    content: "I recommend Scrollpedia to all my students. It's an engaging way to supplement their learning with reliable information."
  }
];

const Testimonials: React.FC = () => {
  return (
    <div className="py-12 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <blockquote className="text-lg italic mb-4 flex-grow">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="flex items-center mt-4">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={testimonial.avatarUrl} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 md:left-4" />
          <CarouselNext className="right-2 md:right-4" />
        </Carousel>
      </div>
    </div>
  );
};

export default Testimonials;