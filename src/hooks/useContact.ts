import React from 'react';
import { Contact, getContact } from '../dpop';

export const useContact = () => {
  const [contact, setContact] = React.useState<Contact>();

  React.useEffect(() => {
    (async () => {
        const c = await getContact();
        setContact(c);
    })();
  }, []);

  return [contact];
};
