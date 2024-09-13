use lettre::message::{header, Mailbox, Message};
use lettre::transport::smtp::authentication::Credentials;
use lettre::{AsyncSmtpTransport, AsyncTransport, Tokio1Executor};

pub async fn send_email(customer_email: &str, mess: &str) -> Result<String, lettre::transport::smtp::Error> {
    let sender_email = "customer.query.de@gmail.com";
    let sender_name = "Rudra Patel";
    let recipient_email = "vvaibhavv3434@gmail.com";
    let body = format!("sender_email : {},   message : {}", customer_email, mess);

    let email = Message::builder()
        .from(Mailbox::new(Some(sender_name.to_string()), sender_email.parse().unwrap()))
        .to(Mailbox::new(None, recipient_email.parse().unwrap()))
        .subject("From the scantextify website")
        .header(header::ContentType::TEXT_PLAIN)
        .body(body)
        .unwrap();

    let creds = Credentials::new(sender_email.to_string(), "bkgk gebv napt zvtx".to_string());

    let mailer = AsyncSmtpTransport::<Tokio1Executor>::relay("smtp.gmail.com")
        .unwrap()
        .credentials(creds)
        .build();

    match mailer.send(email).await {
        Ok(_) => Ok("Email sent".to_string()),
        Err(e) => Err(e)
    }

}

