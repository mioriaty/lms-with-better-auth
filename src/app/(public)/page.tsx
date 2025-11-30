import { Badge } from '@/libs/components/ui/badge';
import { buttonVariants } from '@/libs/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/libs/components/ui/card';
import { BookIcon } from 'lucide-react';
import Link from 'next/link';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: Feature[] = [
  {
    title: 'Comprehensive Courses',
    description: 'Access a wide range of carefully curated courses designed by industry',
    icon: <BookIcon />
  },
  {
    title: 'Interactive Learning',
    description: 'Engage with our platform through interactive lessons, quizzes, and hands-on projects',
    icon: <BookIcon />
  },
  {
    title: 'Progress Tracking',
    description: 'Track your progress and stay motivated with our comprehensive progress tracking system',
    icon: <BookIcon />
  },
  {
    title: 'Community Support',
    description: 'Connect with a vibrant community of learners and educators who share your passion for learning',
    icon: <BookIcon />
  }
];

const HomePage = () => {
  return (
    <>
      <section className="relative py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          <Badge variant="outline">Learning Management System</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Elevate Your Learning Experience</h1>

          <p className="max-w-[700px] text-muted-foreground">
            Welcome to our Learning Management System, your ultimate platform for creating, sharing, and exploring
            educational content. Whether you're a teacher, student, or lifelong learner, our system is designed to
            empower you with the tools you need to succeed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/courses" className={buttonVariants({ variant: 'default', size: 'lg' })}>
              Explore Courses
            </Link>
            <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-32">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="text-4xl mb-4">{feature.icon}</div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
};

export default HomePage;
