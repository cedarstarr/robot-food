import { Html, Head, Body, Container, Heading, Text, Link, Hr } from '@react-email/components'
import { render } from '@react-email/render'

interface Props { url: string; siteName: string }

function PasswordResetEmail({ url, siteName }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', padding: '24px', color: '#111' }}>
        <Heading as="h2">Reset your {siteName} password</Heading>
        <Text style={{ color: '#555' }}>We received a request to reset your password. Click the button below to set a new one. This link expires in 1 hour.</Text>
        <Link href={url} style={{ display: 'inline-block', background: '#e57c2c', color: '#fff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, marginTop: '16px' }}>
          Reset Password
        </Link>
        <Text style={{ color: '#555', fontSize: '14px', marginTop: '24px' }}>If you did not request a password reset, you can safely ignore this email.</Text>
        <Hr style={{ marginTop: '32px' }} />
        <Text style={{ color: '#999', fontSize: '13px' }}>{siteName}</Text>
      </Body>
    </Html>
  )
}

export async function renderPasswordResetEmail(props: Props): Promise<string> {
  return render(<PasswordResetEmail {...props} />)
}
