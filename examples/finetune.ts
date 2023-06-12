// This is an example of a way to finetune Truffle to your own datasets.

// First, we import the Truffle class from the truffle-ts package.
import { Truffle } from '../src';

// Then, we create a Truffle object with our API key.
const truffle = new Truffle("sk_knxh0q5NwtxyNsN2JNzc");

// Then, we call the finetune method with the following parameters:
truffle.finetune({
    model: "truffle-13b", // The model to finetune. Currently, only truffle-13b is supported.
    data: "/home/srikanth/rasta.csv", // The path to the CSV file containing the data to finetune on. Can be a local path or a URL.
    // You can optionally include an image zip here if your data is multi-modal or needs multi modal capabilities.
    // images: "https://raw.githubusercontent.com/deepshard/truffle/master/serve/examples/images.zip", // The path to the ZIP file containing the images. Can be a local path or a URL.
    epochs: 3, // The number of epochs to finetune for. Defaults to 3.
    description: "Rastaman finetune" // A description of the finetuning job. Optional.
}).then((finetune) => {
    console.log(finetune)
})


// Keep in mind that a finetune job is a long running process. We reccomend saving your finetune ID to check on it's progress periodically.

