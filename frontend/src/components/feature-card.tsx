import React from "react";

type FeatureCardProps = {
  title: string;
  description: string;
  bullets: string[];
};

export function FeatureCard({
  title,
  description,
  bullets,
}: FeatureCardProps) {
  return (
    <article className="feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <ul>
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </article>
  );
}
