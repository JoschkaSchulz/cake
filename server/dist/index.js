import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { anlassgebundenesfreigebaeckModel } from './models/anlassgebundenesfreigebaeck.js';
const BackwarenVerschluesselungsTabelle = {
    Broetchen: '0',
    Kranzkuchen: '1',
    Lebkuchen: '2',
    Franzbroetchen: '3',
    Zwieback: '4',
    Schokoladenplaetzchen: '5',
    Christstollen: '6',
    Baklava: '7',
    Zimtschnecke: '8',
    Cheescake: '9',
    Daifuku: 'a',
    Erdbeerkuchen: 'b',
    Apfelzimtkuchen: 'c',
    Melonpan: 'd',
    Schwarzwaeldertorte: 'e',
    Diversebackwarenauseuropaunddemrestderwelt: 'f'
};
const backwarenEntschluesselungsModul = (req, res, next) => {
    for (const [key, value] of Object.entries(BackwarenVerschluesselungsTabelle)) {
        console.log(req.url);
        req.url = req.url.replaceAll(key, value);
    }
    console.log('Hochgeheime Entschluesselung: ' + req.url);
    next();
};
const app = express();
dotenv.config({
    path: './config/config.env',
});
app.use(morgan('combined'));
app.use(express.json());
app.use(backwarenEntschluesselungsModul);
app.use(cors());
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anlassgebundesfreigebaeckmengenspeicherungsmedium';
const AnlassgebundenesfreigebaeckMengenSpeicherungsEntität = await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});
console.log('Database connected!');
app.get('/anlassgebundenesfreigebaeck/:anlassgebundenesfreigebaeck', async (req, res) => {
    console.log('param', req.params["anlassgebundenesfreigebaeck"]);
    const mengeAllerAnlassgebundendenfreigebaecke = await anlassgebundenesfreigebaeckModel.findOne({
        _id: req.params['anlassgebundenesfreigebaeck']
    });
    console.log(mengeAllerAnlassgebundendenfreigebaecke);
    res.status(200).json(mengeAllerAnlassgebundendenfreigebaecke);
});
app.get('/anlassgebundenesfreigebaeck', async (req, res) => {
    const mengeAllerAnlassgebundendenfreigebaecke = await anlassgebundenesfreigebaeckModel.find();
    res.status(200).json(mengeAllerAnlassgebundendenfreigebaecke);
});
app.post('/anlassgebundenesfreigebaeck', (req, res) => {
    anlassgebundenesfreigebaeckModel.create(req.body)
        .then((kuchen) => {
        res.status(200).json({
            message: 'Danke für die Torte',
            id: kuchen._id,
        });
    })
        .catch((err) => {
        res.status(404).json({
            message: 'Nix Torte',
        });
        console.log(err);
    });
});
app.delete('/anlassgebundenesfreigebaeck/:anlassgebundenesfreigebaeck/:bedarfsanteilsnummer', async (req, res) => {
    anlassgebundenesfreigebaeckModel.findById(req.params['anlassgebundenesfreigebaeck'])
        .then((rueckgabewertZumZweckeDerKonvertierung) => {
        if (rueckgabewertZumZweckeDerKonvertierung) {
            const anlassgebundenesfreigebaeck = rueckgabewertZumZweckeDerKonvertierung;
            anlassgebundenesfreigebaeck.anlassgebundenesfreigebaeckbedarfsanteile =
                anlassgebundenesfreigebaeck.anlassgebundenesfreigebaeckbedarfsanteile.map((anlassgebundenesfreigebaeckbedarfsanteil) => {
                    if (anlassgebundenesfreigebaeckbedarfsanteil._id.toString() === req.params['bedarfsanteilsnummer']) {
                        anlassgebundenesfreigebaeckbedarfsanteil.type = 'zumverzehrvorgemerkt';
                        console.log('Ich drücke auf den Kuchen!!');
                    }
                    return anlassgebundenesfreigebaeckbedarfsanteil;
                });
            anlassgebundenesfreigebaeckModel.findByIdAndUpdate(req.params['anlassgebundenesfreigebaeck'], anlassgebundenesfreigebaeck)
                .then(() => {
                console.log('Und wech das Stück');
            })
                .catch((err) => {
                console.log('Speichern geht nicht ... irgendwie ' + JSON.stringify(err));
            });
        }
        else {
            console.log('RückgabewertzurKonvertierung ist nicht ... also existiert nicht... also sie wissen schon');
        }
    })
        .catch((err) => {
        console.log('Error getting AnlassgebundenesFreigebäck');
    });
});
app.post('/anlassgebundenesfreigebaeck/:anlassgebundenesfreigebaeck/:bedarfsanteilsnummer', (req, res) => {
    // TODO : Hier wird der Feedbackzettel hinterlegt.
    anlassgebundenesfreigebaeckModel.findById(req.params['anlassgebundenesfreigebaeck'])
        .then((rueckgabewertZumZweckeDerKonvertierung) => {
        if (rueckgabewertZumZweckeDerKonvertierung) {
            const anlassgebundenesfreigebaeck = rueckgabewertZumZweckeDerKonvertierung;
            anlassgebundenesfreigebaeck.anlassgebundenesfreigebaeckbedarfsanteile =
                anlassgebundenesfreigebaeck.anlassgebundenesfreigebaeckbedarfsanteile.map((anlassgebundenesfreigebaeckbedarfsanteil) => {
                    if (anlassgebundenesfreigebaeckbedarfsanteil._id.toString() === req.params['bedarfsanteilsnummer']) {
                        anlassgebundenesfreigebaeckbedarfsanteil.type = 'zettel';
                        anlassgebundenesfreigebaeckbedarfsanteil.content.feedbackZettel = req.body.feedbackZettel;
                        console.log(JSON.stringify(anlassgebundenesfreigebaeckbedarfsanteil));
                        console.log('Das Feedback ist angekommen!');
                    }
                    return anlassgebundenesfreigebaeckbedarfsanteil;
                });
            anlassgebundenesfreigebaeckModel.findByIdAndUpdate(req.params['anlassgebundenesfreigebaeck'], anlassgebundenesfreigebaeck)
                .then(() => {
                console.log('Feedback wurde weggeschrieben');
                res.status(200).json({
                    success: true,
                    data: 'Feedback written',
                });
            })
                .catch((err) => {
                console.log('Speichern geht nicht ... irgendwie ' + JSON.stringify(err));
                res.status(500).send();
            });
        }
        else {
            console.log('RückgabewertzurKonvertierung ist nicht ... also existiert nicht... also sie wissen schon');
            res.status(404).send();
        }
    })
        .catch((err) => {
        console.log('Error getting AnlassgebundenesFreigebäck');
    });
});
app.listen(process.env.PORT, () => {
    console.log('Started Server on Port ' + process.env.PORT);
});
