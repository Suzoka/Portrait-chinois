//Initialisation de 2 variables utilisés dans plusieurs fonctions (il faillais donc qu'elles soient globales)
let objetsPerso = [];
let etat = "";

//Arborescence de base : Je fetch tout mes modèles ainsi que mes données, puis appel mes différentes fonctions
fetch('modeles/modelePerso.html').then(function (response) {
    response.text().then(function (modelePerso) {
        fetch('modeles/modeleReset.html').then(function (response) {
            response.text().then(function (modeleReset) {
                fetch('modeles/modeleBase.html').then(function (response) {
                    response.text().then(function (modeleBase) {
                        fetch('analogies.json').then(function (response) {
                            response.json().then(function (data) {
                                fetch('modeles/modeleAnalogie.html').then(function (response) {
                                    response.text().then(function (modeleDeveloped) {
                                        generation(data, modeleBase, 'div.analogies');
                                        ajoutDetectionClic(data, modeleDeveloped, modeleReset, 'a', 'div.analogies section', modeleBase, modelePerso);
                                        ajoutNeon(data, 'div.analogies section');
                                        ajoutPopup(modeleBase, modelePerso, modeleReset);
                                        footer();
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
})

//Fonction qui génère chaques sections unes par unes, en fonction du nombre d'éléments qui lui sont envoyés dans "data"
function generation(data, modeleBase, cible) {
    const div = document.querySelector(cible);
    let text = "";
    data.forEach(function (element) {
        text += modeleBase;
        Object.keys(element).forEach(function (clef) {
            text = text.replaceAll("{{" + clef + "}}", element[clef]);
        })
    })
    div.innerHTML = text;
}

//Ajoute le fait que si l'on clique sur une section, elle se "développe"
function ajoutDetectionClic(data, modeleDeveloped, modeleReset, modeleID, cible) {
    const sections = document.querySelectorAll(cible);
    sections.forEach(function (section) {
        section.addEventListener('click', function () {
            let develop = true;
            sections.forEach(function (reset) {
                //Si la section est "développée", la remettre à 0
                if (reset.getAttribute("id").indexOf("m") > 0) {
                    const id = reset.getAttribute("id").replace(modeleID, "").replace("m", "");
                    remiseAZero(data[id - 1], reset, modeleReset);
                    //Si la section cliquée était déjà "développée", changer l'état d'un flag pour ne pas la "redévelopper"
                    if (reset == section) {
                        develop = false;
                    }
                }
            })
            //Si le flag n'a pas été modifié, développer la section
            if (develop) {
                data.forEach(function (donnee) {
                    if (section.getAttribute("id").replace(modeleID, "") == donnee.num) {
                        changementAnalogie(donnee, section, modeleDeveloped);
                    }
                })
            }
        })
    })
}

//Fonction qui permet à chaque section de revenir à un état "non developé"
function remiseAZero(element, section, modeleReset) {
    let text = modeleReset;
    Object.keys(element).forEach(function (clef) {
        text = text.replace("{{" + clef + "}}", element[clef]);
    })
    section.style.width = "50%";
    section.innerHTML = text;
    section.setAttribute('id', (section.getAttribute("id").replace("m", "")));
}

//Fonction qui permet de "développer" une section si elle est cliquée
function changementAnalogie(donnee, section, modeleDeveloped) {
    let text = modeleDeveloped;
    Object.keys(donnee).forEach(function (clef) {
        text = text.replaceAll("{{" + clef + "}}", donnee[clef]);
    })
    section.style.width = "65%";
    section.innerHTML = text;
    section.setAttribute('id', (section.getAttribute("id") + "m"));
    section.querySelector('p').style.color = donnee.couleur
    section.querySelector('p').style.textShadow = "0 0 5px " + donnee.couleur

    //Essaie de rendre un élément "modifier" cliquable, si l'élément est inexistant, ne rien faire
    try {
        ajoutPopupModif(donnee);
    }
    catch { }
}

//Fonction qui ajoute les effets "néon" à chaque section, en se basant sur la couleur stockée dans le data de chaque section
function ajoutNeon(data, cible) {
    const allSection = document.querySelectorAll(cible);
    allSection.forEach(function (section) {
        //Ajouter l'effet si on survole la section avec la sourie
        section.addEventListener('mouseover', function () {
            data.forEach(function (donnee) {
                if (section.getAttribute("id").replace("a", "").replace("m", "").replace("p", "") == donnee.num) {
                    section.querySelector('p').style.color = donnee.couleur;
                    section.style.boxShadow = "0 0 10px " + donnee.couleur;
                    section.querySelector('p').style.textShadow = "0 0 5px " + donnee.couleur;
                }
            })
        })
        //L'enlever lorsque la sourie sort de la section
        section.addEventListener('mouseout', function () {
            section.style.boxShadow = "";
            document.querySelectorAll(cible).forEach(function (sec) {
                if (sec.getAttribute("id").indexOf("m") < 0) {
                    sec.querySelector('p').style.color = "white";
                    sec.querySelector('p').style.textShadow = "";
                }
            })
        })
    })
}

//Fonction qui gère le popup du formulaire en "mode création"
function ajoutPopup(modeleBase, modelePerso, modeleReset) {
    const cliquable = document.querySelector('.formulaire')
    const formulaire = document.querySelector('.popup')
    //Détecte un clique sur le titre qui a la classe formulaire
    cliquable.addEventListener('click', function () {
        //Remet le formulaire à 0
        resetForm();
        //Affiche le formulaire
        formulaire.classList.add('popup-visible');
        formulaire.classList.remove('popup-invisible');
    })
    //Detecte un clique dans le formulaire
    formulaire.addEventListener('click', function (e) {
        //Si nous ne sommes pas dans le cas de figure où nous modifions un élément
        if (etat != "modif") {
            //Si le clique a lieu soit dans la zone extérieur, soit sur le bouton d'envoi, soit sur le texte du bouton d'envoi
            if ((e.target == document.querySelector('div.popup')) || e.target == document.querySelector('.submit') || e.target == document.querySelector('.submit p')) {
                //Masquer le formulaire
                formulaire.classList.add('popup-invisible')
                formulaire.classList.remove('popup-visible')
                //Si le clique avait eu lieu sur le bouton d'envoi ou son texte, push les données dans la variable "objetsPerso"
                if (e.target == document.querySelector('.submit') || e.target == document.querySelector('.submit p')) {

                    const entrees = document.querySelectorAll('form input, form textarea');
                    let bienRempli = "oui";
                    entrees.forEach(function (entree) {
                        if (!entree.validity.valid) {
                            //Indique quel champs est mal rempli
                            bienRempli = entree.getAttribute('name');
                        }
                    })

                    if (bienRempli != "oui") {
                        formulaire.classList.remove('popup-invisible')
                        formulaire.classList.add('popup-visible')
                        //Adapte le message d'erreur selon le champs mal rempli.
                        switch (bienRempli) {
                            case "analogie":
                                alert("Erreur : Ton analogie n'a pas été mise.")
                                break
                            case "ValeurAnalogie":
                                alert("Erreur : La réponse à ton analogie n'a pas été mise.")
                                break
                            case "explication":
                                alert("Erreur : L'explication de ton analogie n'a pas été mise.")
                                break
                            case "detail":
                                alert("Erreur : Tu n'a pas mis de détail.")
                                break
                            case "mail":
                                alert("Erreur : Tu a mal rempli ton mail.")
                                break
                            case "couleur":
                                alert("Erreur : Ta couleur n'a pas l'air d'être un hexacode complet.")
                                break
                            default:
                                alert("Erreur : Un problème à eu lieu.")
                                break
                        }
                    }
                    else {
                        objetsPerso.push({ "num": (objetsPerso.length + 1), "analogie": document.querySelector('input#analogie').value, "valeurAnalogie": document.querySelector('input#valeurAnalogie').value, "explication": document.querySelector('input#explication').value, "detail": document.querySelector('textarea#detail').value, "couleur": '#' + document.querySelector('input#couleur').value, "image": document.querySelector('textarea#image').value, "alt": document.querySelector('textarea#alt').value, "mail": document.querySelector('input#mail').value });
                        generation(objetsPerso, modeleBase.replace("id=\"a{{num}}\"", "id=\"p{{num}}\""), 'div.analogiesPerso');
                        ajoutDetectionClic(objetsPerso, modelePerso, modeleReset, 'p', 'div.analogiesPerso section');
                        ajoutNeon(objetsPerso, 'div.analogiesPerso section');

                        //Génère le lien pour contacter l'API
                        const lien = "https://perso-etudiant.u-pem.fr/~gambette/portrait/api.php?format=json&login=morgan.zarka&courriel=" + document.querySelector('input#mail').value + "&message= Si j'étais " + document.querySelector('input#analogie').value + ", alors je serais " + document.querySelector('input#valeurAnalogie').value + " car " + document.querySelector('input#explication').value + "  -   Détail : " + document.querySelector('input#explication').value + "  -   Le tout avec la couleur #" + document.querySelector('input#couleur').value + "  -   L'image est : " + document.querySelector('textarea#image').value + "  -   Son texte alternatif est " + document.querySelector('textarea#alt').value;

                        //Contact l'API
                        fetch(lien).then(function (response) {
                            response.json().then(function (api) {
                                //Envoie la réponse de l'API
                                alert(api.message);
                            })
                        })
                            //Envoie le message d'erreur si l'API ne répond pas
                            .catch(function (error) {
                                alert('Il y a eu un problème avec l\'envoi de l\'analogie au serveur : ' + error.message);
                            })
                    }
                }
            }
        }
    })
    //Remet la variable etat à 0 (si nous étions en modification, cela repermet au programme de repasser en "mode création", nous nous devions repasser en "mode modif", la variable repasserais à 'modif')
    etat = "";
}

//Remet le formulaire à 0
function resetForm() {
    const formulaire = document.querySelectorAll('form input, form textarea');
    formulaire.forEach(function (entree) {
        entree.value = "";
    })
}

//Fonction qui gère le popup formualire en "mode modif"
function ajoutPopupModif(donee) {
    const cliquable = document.querySelector('p.modif')
    const formulaire = document.querySelector('.popup')
    //Si le bouton "modifier" est cliqué
    cliquable.addEventListener('click', function () {
        //Passe le programme en "mode modif"
        etat = "modif";
        //Entre les données de la section dans le formulaire
        popupModif(donee);
        //Affiche le formulaire
        formulaire.classList.add('popup-visible');
        formulaire.classList.remove('popup-invisible');

        //Detecte un clique dans le formulaire
        formulaire.addEventListener('click', function (e) {
            //Si le clique a lieu soit dans la zone extérieur, soit sur le bouton d'envoi, soit sur le texte du bouton d'envoi
            if ((e.target == document.querySelector('div.popup')) || e.target == document.querySelector('.submit') || e.target == document.querySelector('.submit p')) {
                //Masquer le formulaire
                formulaire.classList.add('popup-invisible')
                formulaire.classList.remove('popup-visible')
                //Si le clique avait eu lieu sur le bouton d'envoi ou son texte, modifie les données dans la bonne case du tableau "objetsPerso"
                if (e.target == document.querySelector('.submit') || e.target == document.querySelector('.submit p')) {
                    objetsPerso[donee.num - 1] = { "num": (donee.num), "analogie": document.querySelector('input#analogie').value, "valeurAnalogie": document.querySelector('input#valeurAnalogie').value, "explication": document.querySelector('input#explication').value, "detail": document.querySelector('textarea#detail').value, "couleur": '#' + document.querySelector('input#couleur').value, "image": document.querySelector('textarea#image').value, "alt": document.querySelector('textarea#alt').value, "mail": document.querySelector('input#mail').value };

                    //Génère le lien pour contacter l'API
                    const lien = "https://perso-etudiant.u-pem.fr/~gambette/portrait/api.php?format=json&login=morgan.zarka&courriel=" + document.querySelector('input#mail').value + "&message=CECI EST UNE MODIF   -  Si j'étais " + document.querySelector('input#analogie').value + ", alors je serais " + document.querySelector('input#valeurAnalogie').value + " car " + document.querySelector('input#explication').value + "  -   Détail : " + document.querySelector('input#explication').value + "  -   Le tout avec la couleur %23" + document.querySelector('input#couleur').value + "  -   L'image est : " + document.querySelector('textarea#image').value + "  -   Son texte alternatif est " + document.querySelector('textarea#alt').value;

                    //Contact l'API
                    fetch(lien).then(function (response) {
                        response.json().then(function (api) {
                            //Envoie la réponse de l'API
                            alert(api.message);
                        })
                    })
                        //Si l'API ne répond pas, envoyer le message d'erreur
                        .catch(function (error) {
                            alert('Il y a eu un problème avec l\'envoi de l\'analogie au serveur : ' + error.message);
                        })
                }
            }
        })
    })
}

//Met les données demandés dans le formulaire
function popupModif(donee) {
    document.querySelector('input#analogie').value = donee.analogie
    document.querySelector('input#valeurAnalogie').value = donee.valeurAnalogie
    document.querySelector('input#explication').value = donee.explication
    document.querySelector('textarea#detail').value = donee.detail
    document.querySelector('input#couleur').value = donee.couleur.replace("#", "")
    document.querySelector('textarea#image').value = donee.image
    document.querySelector('textarea#alt').value = donee.alt
    document.querySelector('input#mail').value = donee.mail
}

//Fonction pour l'animation du footer (une bonne partie du code à été récupéré dans une des corrections de Philippe GAMBETTE)
function footer() {
    var piedDePage = document.querySelector("footer")
    piedDePage.style.overflow = "hidden";
    var hauteur = piedDePage.clientHeight;
    piedDePage.style.height = "6em";

    document.querySelector("footer p").addEventListener("click", function () {
        if (piedDePage.style.height == "6em") {
            var animationPiedDePage = piedDePage.animate([{ "height": hauteur + "px" }], { "duration": 500 });
            animationPiedDePage.addEventListener("finish", function () {
                piedDePage.style.height = hauteur + "px";
            })
            document.querySelectorAll("a").forEach(function (lien) {
                lien.setAttribute("tabindex", "0")
            })
        }
        else {
            var animationPiedDePage = piedDePage.animate([{ "height": "6em" }], { "duration": 500 });
            animationPiedDePage.addEventListener("finish", function () {
                piedDePage.style.height == "6em"
            })
            setTimeout(function () {
                piedDePage.style.height = "6em"
            }, 490)
            document.querySelectorAll("a").forEach(function (lien) {
                lien.setAttribute("tabindex", "-1")
            })
        }
    })
}