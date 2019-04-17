<a href="https://githubsfdeploy.herokuapp.com?owner=TheVishnuKumar&repo=lwc-streaming-api">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>

Features
-------------
- Subscribe Push Topics, Platform Events
- Easy to use LWC APIs.
- Easier control to subscribe, unsubscribe and check status of subscription.


Documentation
-------------
LWC Streaming API component let you to subscrive streaming api channel in the easy way. You just need to provide the channel name. It onmessage event let you to get the payload from streaming api.

	<c-lwc_streaming_api 
        channel="/topic/NewContactCreated" 
        api-version="45.0" 
        debug=true
        onmessage={handleMessage} 
        onerror={handleError} 
        class="lwc_streaming_api-1">
    </c-lwc_streaming_api>

Attributes
----------
This component have three types of attributes.
1. **channel**: This is required attribute. Define the channel name. Ex:  /topic/NewContactCreated and event/My_Event__e.

2. **api-version**: This is optional attribute. It defines that which api version will be used for cometd. If you omit this then it will take 45.0 as default version.

3. **debug**: This is optional attribute. It takes boolean value as the parameter. It allows you to see various logs on console. By default this is set to false if you omit this.

Events
------
This component have two types of events.
1. **onmessage**: This event fire when any streaming api sends the payload/message. You need to define the handler for your component to get the value from this event.
You can get payload from this: event.detail.payload

2. **onerror**: This event fire if any kind of error happens at the LWC streaming api component. You need to define the handler for your component to get the error message from this event.
You can get error from this: event.detail.error

**Note**: You can define debug=true to see all the console results as well.


Methods
----------
This component have three types of methods that you can use to re-subscribe, unsubscrive and check the status of subscription.
1. **subscribe()**: Subscribe the channel if it was destriyed or unsubscribe. You cannot Subscrive a chaneel if it already Subscrived. It prevent the multiple payload event from streaming api.

2. **unsubscribe()**: Unsubscribe the channel. You can Subscrive a chaneel if it is unsubscribed. We can use this to stop receiving payloads.

3. **checkConnection()**: This methods returns true or false. If the channel is subscribed then it will return the true else false.


Example
-------------
**Step 1.** Create a push topic using Developer Console. Copy the following code and execute in the developer console.
What will it do? It will create a push topic name NewContactCreated. Whenever a contact record get created. It will send the payload to the onmessage event.
```
PushTopic pushTopic = new PushTopic();
pushTopic.Name = 'NewContactCreated';
pushTopic.Query = 'select Id,Name from Contact';
pushTopic.ApiVersion = 45.0;
pushTopic.NotifyForOperationCreate = true;
pushTopic.NotifyForOperationUpdate = false;
pushTopic.NotifyForOperationUndelete = false;
pushTopic.NotifyForOperationDelete = false;
pushTopic.NotifyForFields = 'All';
insert pushTopic;
```

**Step 2.** Create a Lightning Web Component name as : lwc_streaming_demo.
Copy and paste the following code to the files.
**Note**: Add the target configuration in meta xml file. so you can add your demo component to the using app builder. In my case i have added the component to the home page.

**lwc_streaming_demo.js**
```javascript
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
```

**lwc_streaming_demo.html**
```html
<template>
    <c-lwc_streaming_api 
        channel="/topic/NewContactCreated" 
        api-version="45.0" 
        debug=true
        onmessage={handleMessage} 
        onerror={handleError} 
        class="lwc_streaming_api-1">
    </c-lwc_streaming_api>

    <lightning-button label="Destroy Connection"  onclick={destroy}></lightning-button>

    <lightning-button label="Restart Connection"  onclick={restart}></lightning-button>

    <lightning-button label="Check Connection"  onclick={checkConnection}></lightning-button>

    <div style="background: white;padding: 50px;">
        <div style="margin:20px;">
            Payload
            <br/>
            {payload}
        </div>
        
        <div style="margin:20px;">
            Error:
            <br/>
            {error}
        </div>

        <div style="margin:20px;">
            Is Connection On:
            <br/>
            {isConnectionOn}
        </div>
    </div>
</template>
```

**lwc_streaming_demo.js-meta.xml**
```html
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata" fqn="lwc_streaming_demo">
    <apiVersion>45.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
        <target>lightning__HomePage</target>
    </targets>
</LightningComponentBundle>
```

**Step 3.** Open the your demo component. Now create some contact reccords and you will see the message/payload on the screen.



