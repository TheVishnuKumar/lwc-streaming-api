import { LightningElement,track } from 'lwc';

export default class Lwc_streaming_demo extends LightningElement {

    @track error = '';
    @track payload = '';
    @track isConnectionOn;

    //Handles the error
    handleError(event){
        //Error is coming in the event.detail.error
        this.error = JSON.stringify(event.detail.error);
    }

    //Handles the message/payload from streaming api
    handleMessage(event){
        //Message is coming in event.detail.payload
        this.payload = this.payload + JSON.stringify(event.detail.payload);
    }

    //This methos is subscribing the channel
    restart(){
        this.template.querySelector('.lwc_streaming_api-1').subscribe();
    }

    //This methos is unsubscribing the channel
    destroy(){
        this.template.querySelector('.lwc_streaming_api-1').unsubscribe();

        this.payload = '';
        this.error = '';
    }

    //This methos is checking if the channel is subscribed or not
    checkConnection(){
        this.isConnectionOn = this.template.querySelector('.lwc_streaming_api-1').checkConnection();
    }
}