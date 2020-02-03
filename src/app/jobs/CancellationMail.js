import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { name, email, problem } = data;

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'A delivery asigned for you was cancelled!',
      template: 'Cancellation',
      context: {
        id: problem.delivery_id,
        provider: problem.delivery.provider.name,
        user: problem.delivery.destination.name,
      },
    });
  }
}

export default new CancellationMail();
