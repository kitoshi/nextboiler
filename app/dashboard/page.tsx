'use client';

import { parsePrompt } from '@/utilities/langChain/promptParser';
import { Button, Typography } from '@mui/material';
import { useState } from 'react';

export default function Dashboard() {
  const [response, setResponse] = useState<string>();
  async function handleChange() {
    const output = await parsePrompt();
    setResponse(output);
  }
  return (
    <>
      <h1>Chat</h1>
      <Button onClick={handleChange}>Use AI</Button>
      <Typography>{response}</Typography>
    </>
  );
}
