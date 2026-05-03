x=0
Etudiants={
        "ADE Lucas":15.33,
        "AGBO Ed":14.33,
        "AKO Anne":14.67,
        "AZA Yves":16.33,
        "OYO Jean":17.25   
    }
while(x==0):
    choix=""
    etudiant=""
    note=0.0
    print("Noms et Prenoms \t \t \t Moyennes de phase \n")
    print("---------------------------------------------------")
    for i in Etudiants:
        print(i,"\t \t \t",Etudiants[i])

    choix=input("Choisissez une opération\nA:Ajouter une note\nQ:Quitter\n").lower()
    match choix :
        case "a":
            i=0
            while(i==0):
                etudiant=input("Entrez le nom de l'étudiant")
                note=float(input("Entrez la note de l'etudiant"))
                if(note>0 and note<=20 and etudiant in Etudiants):
                    i=1
            Etudiants[etudiant]=(Etudiants[etudiant]*3+note)/4
            if(Etudiants[etudiant]>=15):
                print("Opération effectuée. La moyenne générale de ",etudiant,"est de",Etudiants[etudiant],"\n",etudiant,"est admis(e)")    
            else :
                print("Opération effectuée. La moyenne générale de ",etudiant,"est de",Etudiants[etudiant],"\n",etudiant,"est refusée(e)")    
        case "q":
            print("Vous avez quitté")
            x=1 
        case _:
            print("La touche est incorrecte")
        