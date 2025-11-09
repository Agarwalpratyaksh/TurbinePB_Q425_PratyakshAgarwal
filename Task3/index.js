import { create, mplCore } from '@metaplex-foundation/mpl-core'
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  signerIdentity,
  sol,
} from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys'
import { base58 } from '@metaplex-foundation/umi/serializers'
import fs from 'fs'
import path from 'path'

// Create the wrapper function
const createNft = async () => {
 
    const umi = createUmi('https://api.devnet.solana.com')
    .use(mplCore())
    .use(
    irysUploader({
      // mainnet address: "https://node1.irys.xyz"
      // devnet address: "https://devnet.irys.xyz"
      address: 'https://devnet.irys.xyz',
    })
  )


const walletPath = '/home/pratyaksh/.config/solana/devnet.json';
const secret = JSON.parse(fs.readFileSync(walletPath, 'utf8'));


let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));

umi.use(keypairIdentity(keypair));

//==========================================
 const imageFile = fs.readFileSync(
    path.join('./assets/image.jpg')
  )


  const umiImageFile = createGenericFile(imageFile, 'image.jpg', {
    tags: [{ name: 'Content-Type', value: 'image/png' }],
  })


  console.log('Uploading Image...')
  const imageUri = await umi.uploader.upload([umiImageFile]).catch((err) => {
    throw new Error(err)
  })

  console.log('imageUri: ' + imageUri[0])



  const metadata = {
    name: 'ARISE',
    description: 'Only shadow monarch can have this nft',
    image: imageUri[0],
    attributes: [
      {
        trait_type: 'Creator',
        value: 'Pratyaksh',
      },
      {
        trait_type: 'Version',
        value: 'V1',
      },
    ],
    properties: {
      files: [
        {
          uri: imageUri[0],
          type: 'image/jpeg',
        },
      ],
      category: 'image',
    },
  }


  console.log('Uploading Metadata...')
  const metadataUri = await umi.uploader.uploadJson(metadata).catch((err) => {
    throw new Error(err)
  })

  //
  // ** Creating the NFT **
  //

  const asset = generateSigner(umi)

  console.log('Creating NFT...')
  const tx = await create(umi, {
    asset,
    name: 'ARISE',
    uri: metadataUri,
  }).sendAndConfirm(umi)

  const signature = base58.deserialize(tx.signature)[0]

  console.log('\nNFT Created')
  console.log('View Transaction on Solana Explorer')
  console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`)
  console.log('\n')
  console.log('View NFT on Metaplex Explorer')
  console.log(`https://core.metaplex.com/explorer/${asset.publicKey}?env=devnet`)

}

createNft()
