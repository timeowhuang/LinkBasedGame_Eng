class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title);
        this.engine.addChoice("Begin the story");

        this.engine.inventory = []; //Initialize inventory
        this.engine.show("<p>You wake up in a stranger's room. You don't remember how you got here, but you know you must find a way out.</p>");
        this.engine.updateInventory(); // Update inventory display
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation);
    }
}

class Location extends Scene {
    create(key) {
        this.key = key; //Store current scene key for retry on wrong password
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(locationData.Body);

        if (locationData.Choices && locationData.Choices.length > 0) {
            for (let choice of locationData.Choices) {
                if (choice.RequiresItem && !this.engine.hasItem(choice.RequiresItem)) continue;
                if (choice.RequiresItemNotExist && this.engine.hasItem(choice.RequiresItemNotExist)) continue;
                if (choice.AddItem && this.engine.hasItem(choice.AddItem.name)) continue;

                this.engine.addChoice(choice.Text, choice);
            }
        } else {
            this.engine.addChoice("The end.");
        }
    }

    handleChoice(choice) {
        if (choice) {
            this.engine.show(`&gt; ${choice.Text}`);

            //Check required item
            if (choice.RequiresItem && !this.engine.hasItem(choice.RequiresItem)) {
                this.engine.show(`<p><strong>Hint:</strong> ${choice.LockedDescription || "You need a specific item to perform this action."}</p>`);
                return;
            }

            //Handle item added
            if (choice.AddItem) {
                if (this.engine.addItem(choice.AddItem)) {
                    this.engine.show(`<p><strong>Item obtained:</strong> ${choice.AddItem.name}</p>`);
                    if (choice.AfterPickDescription) {
                        this.engine.show(`<p>${choice.AfterPickDescription}</p>`);
                    }
                }
            }

            //Replace Items when its property changed
            if (choice.ReplaceItem && choice.WithItem) {
                if (this.engine.hasItem(choice.ReplaceItem)) {
                    this.engine.removeItem(choice.ReplaceItem);
                    this.engine.addItem(choice.WithItem);
                    this.engine.show(`<p><strong>Item changed:</strong> ${choice.ReplaceItem} became ${choice.WithItem.name}</p>`);
                }
            }

            //Enter passwords/prompted
            if (choice.NeedsPassword) {
                let userPassword = prompt(choice.PasswordPrompt || "Enter Password:");
                if (userPassword === choice.CorrectPassword) {
                    this.engine.show(`<p><strong>Password Correct!</strong> Door opened。</p>`);
                    this.engine.gotoScene(Location, choice.Target);
                } else {
                    this.engine.show(`<p><strong>Password incorrect!</strong> Try again。</p>`);
                    //When password is not correct, Retry same scene
                    this.engine.gotoScene(Location, this.key);
                }
                return;
            }

            //change back to default scene 
            this.engine.gotoScene(Location, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');