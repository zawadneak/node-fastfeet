import Mail from '../../lib/Mail';

class DeliveryMail {
  get key() {
    return 'DeliveryMail';
  }

  async handle({ data }) {
    const {
      street,
      number,
      complement,
      city,
      isProviderValid,
      isRecipientValid,
      id,
    } = data;

    await Mail.sendMail({
      to: `${isProviderValid.name} <${isProviderValid.email}>`,
      subject: 'You have been asigned a new delivery!',
      template: 'Delivery',
      context: {
        provider: isProviderValid.name,
        recipient: isRecipientValid.name,
        address: `${street} - ${number}, ${city}  ${complement || ' '} `,
        id,
      },
    });
  }
}

export default new DeliveryMail();
