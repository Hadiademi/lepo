import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface BookingConfirmedEmailProps {
  clientName: string;
  salonName: string;
  startsAt: string;
  serviceNames: string[];
  totalEur: string;
  bookingUrl: string;
}

export default function BookingConfirmedEmail({
  clientName,
  salonName,
  startsAt,
  serviceNames,
  totalEur,
  bookingUrl,
}: BookingConfirmedEmailProps) {
  return (
    <Html lang="sl">
      <Head />
      <Preview>Rezervacija potrjena — {salonName}</Preview>
      <Body
        style={{
          backgroundColor: "#0A0F0C",
          color: "#ECE6D6",
          fontFamily: "Inter, system-ui, sans-serif",
          margin: 0,
          padding: "32px 0",
        }}
      >
        <Container
          style={{ maxWidth: 520, margin: "0 auto", padding: "0 24px" }}
        >
          <Heading
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 400,
              fontSize: 32,
              letterSpacing: "-0.03em",
              color: "#ECE6D6",
              margin: 0,
            }}
          >
            Lep<em style={{ fontStyle: "italic", color: "#C28F5C" }}>o</em>
          </Heading>
          <Text
            style={{
              fontSize: 14,
              color: "rgba(236,230,214,0.6)",
              marginTop: 8,
            }}
          >
            Atelier · Slovenija
          </Text>

          <Section style={{ marginTop: 32 }}>
            <Heading
              as="h2"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 400,
                fontSize: 22,
                letterSpacing: "-0.02em",
                color: "#ECE6D6",
                margin: 0,
              }}
            >
              Pozdravljen{clientName ? `, ${clientName}` : ""}.
            </Heading>
            <Text
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: "rgba(236,230,214,0.78)",
              }}
            >
              Tvoja rezervacija v salonu{" "}
              <strong style={{ color: "#ECE6D6" }}>{salonName}</strong> je
              potrjena.
            </Text>
          </Section>

          <Section
            style={{
              marginTop: 24,
              padding: 20,
              borderRadius: 16,
              border: "1px solid rgba(194,143,92,0.18)",
              backgroundColor: "#131A16",
            }}
          >
            <Text
              style={{
                margin: 0,
                fontSize: 12,
                color: "rgba(236,230,214,0.5)",
              }}
            >
              TERMIN
            </Text>
            <Text
              style={{
                margin: "4px 0 0",
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 20,
                color: "#ECE6D6",
              }}
            >
              {startsAt}
            </Text>

            <Text
              style={{
                marginTop: 16,
                fontSize: 12,
                color: "rgba(236,230,214,0.5)",
              }}
            >
              STORITVE
            </Text>
            {serviceNames.map((name) => (
              <Text
                key={name}
                style={{ margin: "2px 0", fontSize: 14, color: "#ECE6D6" }}
              >
                · {name}
              </Text>
            ))}

            <Text
              style={{
                marginTop: 16,
                fontSize: 12,
                color: "rgba(236,230,214,0.5)",
              }}
            >
              SKUPAJ
            </Text>
            <Text
              style={{
                margin: "4px 0 0",
                fontSize: 18,
                color: "#C28F5C",
                fontWeight: 600,
              }}
            >
              {totalEur} €
            </Text>
          </Section>

          <Section style={{ marginTop: 24 }}>
            <a
              href={bookingUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#C28F5C",
                color: "#1A1209",
                fontWeight: 600,
                fontSize: 14,
                padding: "12px 22px",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              Poglej rezervacijo
            </a>
          </Section>

          <Text
            style={{
              marginTop: 32,
              fontSize: 12,
              color: "rgba(236,230,214,0.4)",
              lineHeight: 1.6,
            }}
          >
            Če rezervacije ne moreš obdržati, jo prekliči preko aplikacije
            najmanj 24 ur pred terminom, da se izogneš zaračunavanju depozita.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
