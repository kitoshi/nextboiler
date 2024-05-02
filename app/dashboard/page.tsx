'use client';

import { parsePrompt } from '@/utilities/langChain/promptParser';
import { Button, Typography } from '@mui/material';
import { useState } from 'react';

export default function Dashboard() {
  const [stuff, setStuff] = useState<string>();
  async function handleChange() {
    const output = await parsePrompt();
    setStuff(output);
  }
  return (
    <>
      <h1>Questionnaire</h1>
      <Button onClick={handleChange}>Use AI</Button>
      <Typography>{stuff}</Typography>
    </>
  );
}
