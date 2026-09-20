import React from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Quote } from "lucide-react";

export function TestimonialImpactSection() {
  const stories = [
    {
      quote:
        "Every round I log now has a genuine secondary purpose. Seeing a percentage of my subscription directly fund clean water boreholes gives every weekend game real meaning.",
      author: "Marcus Vance",
      title: "Subscriber since January 2026 · Handicap 11",
      cause: "Clean Water Allies",
    },
    {
      quote:
        "Digital Heroes avoids all the usual country-club noise. The interface is razor-sharp, score logging takes thirty seconds, and our local youth mentorship group receives steady monthly checks.",
      author: "Elena Rostova",
      title: "Subscriber & Community Organizer",
      cause: "Youth Horizon Initiative",
    },
    {
      quote:
        "When I matched 4 numbers last month, the verification process was seamless. I uploaded my official scorecard screenshot and the admin verified it in under an hour.",
      author: "David Thorne",
      title: "Tier 2 Winner & Veteran Supporter",
      cause: "Veterans Forward Project",
    },
  ];

  return (
    <section className="py-24 border-b border-border-subtle bg-bg-deep">
      <Container size="wide">
        <div className="max-w-2xl space-y-3 mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-text-muted block">
            Community Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-white tracking-tight">
            Impact in the Real World.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, i) => (
            <Card
              key={i}
              variant="gradient"
              className="flex flex-col justify-between space-y-6 hover:border-border-silver transition-colors"
            >
              <div className="space-y-4">
                <Quote className="w-6 h-6 text-blue-400 opacity-60" />
                <p className="text-sm text-text-secondary leading-relaxed italic">
                  &ldquo;{story.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-border-subtle space-y-1">
                <span className="text-sm font-medium text-white block">{story.author}</span>
                <span className="text-xs text-text-muted block">{story.title}</span>
                <span className="text-xs font-mono text-blue-400 block pt-1">
                  Supported: {story.cause}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
