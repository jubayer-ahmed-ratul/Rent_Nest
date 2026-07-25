import app from "./app";
import "dotenv/config"
import config from "./config";
const PORT=config.port;
async function main() {
    try {
        app.listen(PORT,()=>{
            console.log(`server is running on port ${PORT}`);
        })
        
    } catch (error) {
        
    }
    
}
main();