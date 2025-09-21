'use server';
/**
 * @fileOverview A flow for handling Google Sign-In.
 *
 * - googleSignIn - A function that handles the Google Sign-In process.
 * - GoogleSignInInput - The input type for the googleSignIn function.
 * - GoogleSignInOutput - The return type for the googleSignIn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}


const GoogleSignInInputSchema = z.object({
  idToken: z.string().describe('The ID token from Google Sign-In.'),
});
export type GoogleSignInInput = z.infer<typeof GoogleSignInInputSchema>;

const GoogleSignInOutputSchema = z.object({
  customToken: z.string().describe('Firebase custom token.'),
});
export type GoogleSignInOutput = z.infer<typeof GoogleSignInOutputSchema>;

export async function googleSignIn(
  input: GoogleSignInInput
): Promise<GoogleSignInOutput> {
  return googleSignInFlow(input);
}

const googleSignInFlow = ai.defineFlow(
  {
    name: 'googleSignInFlow',
    inputSchema: GoogleSignInInputSchema,
    outputSchema: GoogleSignInOutputSchema,
  },
  async input => {
    try {
      const decodedToken = await admin.auth().verifyIdToken(input.idToken);
      const uid = decodedToken.uid;
      
      const customToken = await admin.auth().createCustomToken(uid);
      
      return {
        customToken,
      };
    } catch (error) {
      console.error('Error in googleSignInFlow:', error);
      throw new Error('Failed to process Google Sign-In.');
    }
  }
);
