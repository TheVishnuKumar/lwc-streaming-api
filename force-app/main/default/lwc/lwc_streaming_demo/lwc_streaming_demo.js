import { LightningElement,track } from 'lwc';

export default class Lwc_streaming_demo extends LightningElement {

    @track error = '';
    @track payload = '';
    @track isConnectionOn;

    handleError(event){
        this.error = JSON.stringify(event.detail.error);
    }

    handleMessage(event){
        this.payload = this.payload + JSON.stringify(event.detail.payload);
    }

    restart(){
        this.template.querySelector('.lwc_streaming_api-1').restartConnection();
    }

    destroy(){
        this.template.querySelector('.lwc_streaming_api-1').destroy();

        this.payload = '';
        this.error = '';
    }

    checkConnection(){
        this.isConnectionOn = this.template.querySelector('.lwc_streaming_api-1').checkConnection();
    }
}