import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getCharityBySlug, getCharities } from "@/lib/charities/actions";
import { Calendar, MapPin, ArrowLeft, ArrowUpRight, Ban, Star } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const charities = await getCharities({ activeOnly: false });
  return charities.map((c) => ({
    slug: c.slug,
  }));
}

export default async function CharityProfilePage({ params }: Props) {
  const { slug } = await params;
  const charity = await getCharityBySlug(slug);

  if (!charity) {
    notFound();
  }

  return (
    <div className="py-16 sm:py-24 bg-bg-deep space-y-16">
      <Container size="wide">
        {/* Back Link */}
        <Link
          href="/charities"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-secondary hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Causes
        </Link>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="blue">{charity.category}</Badge>
              {charity.is_featured && (
                <Badge variant="red" className="flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-current" /> Featured Partner
                </Badge>
              )}
              {!charity.is_active && (
                <Badge variant="charcoal" className="border-red-500/50 text-red-400 flex items-center gap-1">
                  <Ban className="w-2.5 h-2.5" /> Archived / Inactive
                </Badge>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-serif font-medium text-white tracking-tight leading-tight">
              {charity.name}
            </h1>

            {charity.tagline && (
              <p className="text-lg text-text-silver leading-relaxed font-serif italic">
                &ldquo;{charity.tagline}&rdquo;
              </p>
            )}

            <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center gap-4">
              {charity.is_active ? (
                <Link href={`/signup?charity=${charity.id}`}>
                  <Button variant="primary" size="md" className="font-mono text-xs uppercase">
                    Select Cause at Signup <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              ) : (
                <div className="p-3 rounded bg-surface-charcoal border border-border-subtle text-xs font-mono text-text-muted flex items-center gap-2">
                  <Ban className="w-4 h-4 text-red-400 shrink-0" />
                  <span>This charity is archived and cannot be selected for new allocations (PRD § 07).</span>
                </div>
              )}
            </div>
          </div>

          {/* Media Card */}
          <div className="lg:col-span-5 relative h-80 rounded-md overflow-hidden border border-border-silver/40 shadow-panel bg-surface-charcoal">
            {charity.hero_image ? (
              <Image
                src={charity.hero_image}
                alt={charity.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted font-mono text-xs">
                No hero image on file
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        </div>
      </Container>

      {/* Impact Stats Strip */}
      {charity.impact_metrics && charity.impact_metrics.length > 0 && (
        <section className="border-y border-border-subtle bg-bg-near py-12">
          <Container size="wide">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {charity.impact_metrics.map((metric, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-3xl sm:text-4xl font-mono font-bold text-white block">
                    {metric.value}
                  </span>
                  <span className="text-xs font-mono text-text-secondary uppercase tracking-wider block">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Detailed Narrative & Events */}
      <Container size="wide">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Mission Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl font-serif font-medium text-white">Mission & Operations</h2>
            <div className="prose prose-invert max-w-none text-text-secondary text-sm leading-relaxed space-y-4">
              <p>{charity.mission}</p>
              <p>{charity.description}</p>
            </div>
          </div>

          {/* Upcoming Golf Days & Fundraisers (PRD § 08.2) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-2xl font-serif font-medium text-white">
              Upcoming Events & Golf Days
            </h2>
            {!charity.events || charity.events.length === 0 ? (
              <Card variant="default">
                <p className="text-xs text-text-secondary">
                  No upcoming events scheduled at this time. Check back soon for seasonal community golf days.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {charity.events.map((evt) => (
                  <Card key={evt.id} variant="gradient" className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{evt.date}</span>
                    </div>
                    <h3 className="text-base font-serif font-medium text-white">{evt.title}</h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{evt.location}</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed pt-1">
                      {evt.description}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
