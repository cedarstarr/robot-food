import { Html, Head, Body, Container, Heading, Text, Link, Hr } from '@react-email/components'
import { render } from '@react-email/render'

interface Props { url: string; siteName: string }

function VerifyEmailTemplate({ url, siteName }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', padding: '24px', color: '#111' }}>
        <Heading as="h2">Verify your {siteName} email</Heading>
        <Text style={{ color: '#555' }}>Thanks for signing up! Click the button below to verify your email address and start cooking.</Text>
        <Link href={url} style={{ display: 'inline-block', background: '#e57c2c', color: '#fff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, marginTop: '16px' }}>
          Verify Email
        </Link>
        <Text style={{ color: '#555', fontSize: '14px', marginTop: '24px' }}>This link expires in 24 hours.</Text>
        <Hr style={{ marginTop: '32px' }} />
        <Text style={{ color: '#999', fontSize: '13px' }}>{siteName}</Text>
      </Body>
    </Html>
  )
}

export async function renderVerifyEmail(props: Props): Promise<string> {
  return render(<VerifyEmailTemplate {...props} />)
}
