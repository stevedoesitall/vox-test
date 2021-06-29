const express = require("express")
const fetch = require("node-fetch")

require("dotenv").config()

const app = express()
const router = express.Router()

const port = process.env.PORT || 8082

app.use("/list",    
    router.get("/", async (req, res) => {
        const listName = req.query.list
        const brandName = req.query.brand

        let apiKey
        let apiSecret

        //Switch between API credentials depending on the brand param
        switch (brandName) {
            case "Brand 1":
                apiKey = process.env.BRAND_1_API_KEY
                apiSecret = process.env.BRAND_1_API_SECRET
                break

            case "Brand 2":
                apiKey = process.env.BRAND_2_API_KEY
                apiSecret = process.env.BRAND_2_API_SECRET
                break
            
            default:
                apiKey = process.env.API_KEY
                apiSecret = process.env.API_SECRET
        }

        const sailthru = require("sailthru-client").createSailthruClient(apiKey, apiSecret)

        sailthru.apiGet("stats", {
            stat: "list",
            list: listName
        }, (err, listRes) => {
            if (err) {
                console.log("ERROR", err)
                return res.status(404).json(err)
            }

            const message = 
            `List: ${listRes.list};
            Total users: ${listRes.email_count};
            New signups: ${listRes.lists_signup_count};
            New removals: ${listRes.lists_remove_count}`

            fetch(process.env.SLACK_URL, {
                method: "POST",
                body: JSON.stringify({"text": message})
            })

            res.status(200).json(listRes)
        })
    })
)

app.listen(port, err => {
	if (err) {
		console.log("Error starting server")
	} else {
		console.log(`Server running on port ${port}`)
	}
})