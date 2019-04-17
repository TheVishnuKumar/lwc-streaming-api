public class LWC_StreamingApiController {
    @AuraEnabled
    public static string getSessionId() {
        return UserInfo.getSessionId();
    }
}
