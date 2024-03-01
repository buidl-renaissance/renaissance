import React, { useState } from "react";
import { Button, Modal, Form, Message } from "semantic-ui-react";
import useAsync from "./useAsync";
import { useWeb3Context } from "../context/Web3";
import { createProposal } from "../api/grant-governance";


interface Props {
    open: boolean;
    onClose: (event?: any) => void;
}

interface proposal {
    id: Number,
    description: string,
    creator: string,
    forVotes: Number,
    againstVotes:  Number,
    executed: boolean,
    revoked: boolean,
    queued: boolean
}

interface proposalParams {
    description: string
}

const CreateProposal: React.FC<Props> = ({ open, onClose }) => {
    const {
      state: { web3, account },
    } = useWeb3Context();
  
    const { pending, error, call } = useAsync<proposalParams, any>(
      async (params) => {
        if (!web3) {
          throw new Error("No web3");
        }
  
        await createProposal(web3, account, params);
      }
    );

    const [inputs, setInputs] = useState({
        description: "",
    });


    function onChange(name: string, e: React.ChangeEvent<HTMLInputElement>) {
        setInputs({
          ...inputs,
          [name]: e.target.value,
        });
      }
    
      async function onSubmit() {
        if (pending) {
          return;
        }
    
        const { error } = await call({
          ...inputs,
          description: inputs.description.toString(),
        });
    
        if (!error) {
          onClose();
        }
      }

    return (
        <Modal open={open} onClose={onClose}>
          <Modal.Header>Create Proposal</Modal.Header>
          <Modal.Content>
            {error && <Message error>{error.message}</Message>}
            <Form onSubmit={onSubmit}>
              <Form.Field>
                <label>Description</label>
                <Form.Input
                  value={inputs.description}
                  onChange={(e) => onChange("description", e)}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button
              color="green"
              onClick={onSubmit}
              disabled={pending}
              loading={pending}
            >
              Create Proposal
            </Button>
          </Modal.Actions>
        </Modal>
      );
}

export default CreateProposal;