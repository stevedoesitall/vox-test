const express = require("express")
const fetch = require("node-fetch")

const app = express()
const router = express.Router()

const apiKey = process.env.API_KEY
const apiSecret = process.env.API_SECRET
const sailthru = require("sailthru-client").createSailthruClient(apiKey, apiSecret)

const port = process.env.PORT || 8082

app.use("/list", 
    router.get("/:list", async (req, res) => {
        const listName = req.params.list
        sailthru.apiGet("list", {
            list: listName
        }, (err, listRes) => {
            if (err) {
                console.log("ERROR", err)
                return res.status(404).json(err)
            }

            const message = `List: ${listRes.list}; total users: ${listRes.count}`

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