"use client"
import Image from 'next/image'
import { Amplify, Auth } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css'

import { getCurrentUser,fetchUserAttributes, fetchAuthSession  } from 'aws-amplify/auth';
import { get, post } from 'aws-amplify/api';
import awsconfig from "../aws-exports";

Amplify.configure(awsconfig, {ssr:true}); // <=== Initialize Amplify with the exports config
const existingConfig = Amplify.getConfig(); // <=== the initialized config should now be returned to existingConfig

Amplify.configure({
  ...existingConfig,
  Auth: {
    Cognito: {
      userPoolClientId: '3pqkoa0pqj54i1cm8kove9ohir',
      userPoolId: 'ap-southeast-1_Mx3O0sUk2',
      // loginWith: { // Optional
      //   oauth: {
      //     domain: 'abcdefghij1234567890-29051e27.auth.us-east-1.amazoncognito.com',
      //     scopes: ['openid email phone profile aws.cognito.signin.user.admin '],
      //     redirectSignIn: ['http://localhost:3000/','https://example.com/'],
      //     redirectSignOut: ['http://localhost:3000/','https://example.com/'],
      //     responseType: 'code',
      //   },
      //   username: 'true',
      //   email: 'false', // Optional
      //   phone: 'false', // Optional
      // }
    },
    API: {
      ...existingConfig.API?.REST,
      REST: {
        ...existingConfig.API?.REST,
        'api-sls': {
          endpoint:
            'https://kgej3tyhk5.execute-api.ap-southeast-1.amazonaws.com/dev',
          region: 'ap-southeast-1', // Optional

          // headers: async() => {
          //   return {Authorization: authToken};
          // }
        }
      }
    }    
  }
});

export default function Home() {
  const getUserData = async() => {
    const { username, userId, signInDetails } = await getCurrentUser();
    const userAttributes = await fetchUserAttributes();
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString()

    // console.log(signInDetails);  
    // console.log(userAttributes);  
    const restOperation = get({
      apiName: 'api-sls',
      path: '/hello',
      options:{
        headers:{
          Authorization: authToken
        }
      }
    });
    const { body } = await restOperation.response;
    const str = await body.text();


    console.log(str);    

  }
  const postUserData = async() => {
    const { username, userId, signInDetails } = await getCurrentUser();
    const userAttributes = await fetchUserAttributes();
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString()

    // console.log(signInDetails);  
    // console.log(userAttributes);  
    const restOperation = post({
      apiName: 'api-sls',
      path: '/hello',
      options:{
        headers:{
          Authorization: authToken
        },
        body:{
          name: username,
          email:signInDetails.loginId,
          age:18
        }
      }
    });
    const { body, headers } = await restOperation.response;
    const str = await body.json()


    console.log(str);    

  }
  return (
    <div>
      <h1>Serverless tutorial</h1>
      <Authenticator loginMechanisms={['email']} signUpAttributes={['name']} socialProviders={['google']}>
      {({ signOut, user }) => (
        <main>
          <h1>Hello </h1>
          <p>Secret message</p>
          <button onClick={getUserData}>Call GET API</button><br/>
          <button onClick={postUserData}>Call POST API</button><br/>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
    </div>
  )
}