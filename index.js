const express = require('express')
const PORT = process.env.PORT || 5000

express()
.use(express.static(path.join(__dirname, 'public')))
.set('views', path.join(__dirname, 'views'))
.set('view engine', 'ejs')
.get('/', (req, res)=> {res.render('pages/home.ejs');})
.listen(PORT, () => console.log(`Listening on ${ PORT }`))