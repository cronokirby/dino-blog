use clap::{Parser, Subcommand, arg};

#[derive(Parser, Debug)]
#[command(name = "dino-cli")]
pub struct Opts {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    Add {
        #[command(subcommand)]
        action: Add,
    },
}

#[derive(Subcommand, Debug)]
pub enum Add {
    Post {
        #[arg(long)]
        title: Option<String>,
    },
    Note {
        #[arg(long)]
        title: Option<String>,
    },
    Ref {
        #[arg(long)]
        title: Option<String>,
        #[arg(long)]
        date: Option<String>,
    },
}

fn main() {
    let opts = Opts::parse();
    println!("{:?}", &opts);
}
